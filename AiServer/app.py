from flask import Flask, request, jsonify
import requests, os, json, base64
from openai import OpenAI
from datetime import datetime
import config
from ultralytics import YOLO
import pika
import threading
import json

app = Flask(__name__)

if os.name == 'nt':
    base_dir = "C:/AutoClass"
else:
    base_dir = "/data/autoClass"

API_KEY = "test"


def check_inclusion(labels, class_list):
    result = []
    for word in labels:
        if any(test_word in word for test_word in class_list):
            result.append(next((test_word for test_word in class_list if test_word in word), 'none'))
        else:
            result.append('none')
    return result


def set_labels(labels, dtos):
    for label, (dto, _) in zip(labels, dtos):
        dir_path = os.path.join(base_dir, label)
        os.makedirs(dir_path, exist_ok=True)

        file_name = f"{label}.txt"
        file_path = os.path.join(dir_path, file_name)

        image_url = dto['url']
        response = requests.get(image_url)
        image_path = os.path.join(dir_path, f"{label}_{datetime.now().strftime('%Y%m%d%H%M%S%f')}.jpg")
        with open(image_path, 'wb') as img_file:
            img_file.write(response.content)

        with open(file_path, 'a') as file:
            data = {"id": dto['id'], "name": label, "url": image_url}
            file.write(json.dumps(data) + '\n')

    return {"labels": labels, "dtos": dtos}


def get_labels_to_ids(labels, dtos):
    labels_to_ids = {}
    for label, dto_url_tuple in zip(labels, dtos):
        dto, url = dto_url_tuple
        # print(f"Processing label: {label} with dto: {dto}")
        if 'id' in dto:
            if label in labels_to_ids:
                labels_to_ids[label].append(dto['id'])
            else:
                labels_to_ids[label] = [dto['id']]
        else:
            print(f"'id' is not found in dto: {dto}")
    return labels_to_ids


def is_url_image(image_url):
    image_formats = ("image/png", "image/jpeg", "image/jpg")
    r = requests.head(image_url)
    if r.headers["content-type"] in image_formats:
        return True
    return False


def encode_image(url):
    response = requests.get(url)
    image_content = response.content
    base64_image = base64.b64encode(image_content)
    return base64_image.decode('utf-8')


def process_data(request, operation):
    api_key = request.headers.get('x-api-key')
    if not api_key or api_key != API_KEY:
        return jsonify({'message': 'Invalid API key'}), 403

    data = request.json

    testClass = data.get('testClass', [])
    testDtos = data.get('testImages', [])
    testImages = [dto['url'] for dto in testDtos]

    filtered_dto_image_pairs = [(dto, url) for dto, url in zip(testDtos, testImages) if is_url_image(url)]

    def chunk_list(lst, n):
        for i in range(0, len(lst), n):
            yield lst[i:i + n]

    chunks = list(chunk_list(filtered_dto_image_pairs, 10))

    client = OpenAI()
    all_labels = []

    for chunk in chunks:
        if operation == 'classify':
            images_for_ai = [{"type": "image_url", "image_url": {"url": url, "detail": "low"}} for _, url in chunk]
        else:
            encoded_images = [encode_image(url) for _, url in chunk]
            images_for_ai = [
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img}", "detail": "low"}} for img in
                encoded_images]

        try:
            completion = client.chat.completions.create(
                model="gpt-4-vision-preview",
                messages=[
                    {
                        "role": "user",
                        "content": [
                                       {"type": "text",
                                        "text": "You are an AI model that classifies images that are closest to the list I provide. To answer, "
                                                "just say the words from the list I provided with ',' separator. The list I provide : "
                                                + ','.join(testClass)},
                                   ] + images_for_ai,
                    }
                ],
                max_tokens=2048,
            )
        except Exception as e:
            print(f"Error processing images: {e}")
            for _, url in chunk:
                print(f"Image URL: {url}")
            raise

        chunk_labels = check_inclusion(completion.choices[0].message.content.split(','), testClass)
        all_labels.extend(chunk_labels)

        if operation == 'classify':
            set_labels(chunk_labels, chunk)  # Pass the current chunk for labeling

    labels_to_ids = get_labels_to_ids(all_labels, filtered_dto_image_pairs)
    labels_and_ids = [{'label': label, 'ids': ids} for label, ids in labels_to_ids.items()]

    return labels_and_ids


@app.route('/api/classify', methods=['POST'])
def classify_data():
    return process_data(request, 'classify')


@app.route('/api/testclassfiy', methods=['POST'])
def test_data():
    return process_data(request, 'test')


@app.route('/')
def hello_world():
    api_key = request.headers.get('x-api-key')
    if not api_key or api_key != API_KEY:
        return jsonify({'message': 'Invalid API key'}), 403

    return 'Hello, World!'


@app.route('/health', methods=['GET'])
def health_check():
    return 'OK', 200


class RabbitMQConnection:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(RabbitMQConnection, cls).__new__(cls)
                cls._connection = None
                cls._channel = None
        return cls._instance

    def get_channel(self):
        if self._connection is None or self._connection.is_closed:
            self._connection = pika.BlockingConnection(
                pika.ConnectionParameters(host=config.RABBITMQ_HOST, port=config.RABBITMQ_PORT))
            self._channel = self._connection.channel()
            self._channel.queue_declare(queue=config.RABBITMQ_RESPONSE_QUEUE, durable=True)
        return self._channel


def send_response_to_queue(correlation_id, response_data):
    channel = RabbitMQConnection().get_channel()
    message = json.dumps(response_data)
    channel.basic_publish(
        exchange="",
        routing_key=config.RABBITMQ_RESPONSE_QUEUE,
        body=message,
        properties=pika.BasicProperties(
            correlation_id=correlation_id,
            delivery_mode=2,
        ))
    print(" [x] Sent response to ClassfiyResponseQueue")


def process_data_wrapper(ch, method, properties, body):
    try:
        message = json.loads(body.decode('utf-8'))
        message = json.loads(message)
        print(f"Received message: {message}")

        class DummyRequest:
            def __init__(self, json_data):
                self.json = json_data
                self.headers = {'x-api-key': API_KEY}

        dummy_request = DummyRequest(message)
        data = dummy_request.json

        operation = 'classify'
        labels_and_ids = process_data(dummy_request, operation)
        result = {
            'requesterId': data.get('requesterId'),
            'workspaceId': data.get('workspaceId'),
            'labelsAndIds': labels_and_ids
        }

        # result = 'dummy result'

        send_response_to_queue(properties.correlation_id, result)
        ch.basic_ack(delivery_tag=method.delivery_tag)
    except pika.exceptions.StreamLostError:
        print("Connection lost, attempting to reconnect...")
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)
    except Exception as e:
        print(f"Unexpected error occurred: {e}")
        ch.basic_ack(delivery_tag=method.delivery_tag)


_is_consumer_thread_started = False
connection = None


def start_consumer():
    global _is_consumer_thread_started
    global connection
    if _is_consumer_thread_started:
        return

    _is_consumer_thread_started = True
    while True:
        try:
            if connection is None or connection.is_closed:
                connection = pika.BlockingConnection(
                    pika.ConnectionParameters(config.RABBITMQ_HOST, config.RABBITMQ_PORT))
            channel = connection.channel()
            channel.exchange_declare(exchange=config.RABBITMQ_EXCHANGE, exchange_type='direct', durable=True)
            channel.queue_declare(queue=config.RABBITMQ_QUEUE, durable=True)

            channel.basic_qos(prefetch_count=3)
            channel.basic_consume(queue=config.RABBITMQ_QUEUE, on_message_callback=process_data_wrapper, auto_ack=False)

            print(' [*] Waiting for messages. To exit press CTRL+C')
            channel.start_consuming()
        except pika.exceptions.StreamLostError:
            print("Connection lost, attempting to reconnect...")
            continue
        except Exception as e:
            print(f"Unexpected error occurred: {e}. Retrying...")
            continue
        except KeyboardInterrupt:
            print("Exiting consumer thread...")
            break


if __name__ == '__main__':
    consumer_thread = threading.Thread(target=start_consumer).start()
    app.run(host='0.0.0.0', port=5000)
