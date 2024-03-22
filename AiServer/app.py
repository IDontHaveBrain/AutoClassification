from flask import Flask, request, jsonify
import requests, os, json, base64
from openai import OpenAI
from datetime import datetime
from ultralytics import YOLO

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
    for label, dto in zip(labels, dtos):
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
    for label, dto_url_tuple in zip(labels, dtos):  # unpack the tuple into dto and url
        dto, url = dto_url_tuple  # unpack the tuple into dto and url
        print(f"Processing label: {label} with dto: {dto}")  # Print the current label and dto
        # Ensure that 'id' is in dto
        if 'id' in dto:
            # Collect ids based on label
            if label in labels_to_ids:
                labels_to_ids[label].append(dto['id'])
            else:
                labels_to_ids[label] = [dto['id']]
        else:
            print(f"'id' is not found in dto: {dto}")  # Print problematic dto
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


@app.route('/api/train', methods=['POST'])
def train_data():
    api_key = request.headers.get('x-api-key')
    if not api_key or api_key != API_KEY:
        return jsonify({'message': 'Invalid API key'}), 403

    data = request.json

    testClass = data.get('testClass', [])
    testDtos = data.get('testImages', [])
    # Extract urls from dtos
    testImages = [dto['url'] for dto in testDtos]

    filtered_dto_image_pairs = [(dto, url) for dto, url in zip(testDtos, testImages) if is_url_image(url)]
    encoded_images = [encode_image(url) for dto, url in filtered_dto_image_pairs]

    client = OpenAI()
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
                           ] + [
                               {"type": "image_url",
                                "image_url": {"url": f"data:image/jpeg;base64,{img}", "detail": "low"}} for img in
                               encoded_images
                           ],
            }
        ],
        max_tokens=2048,
    )

    resultJson = completion.model_dump_json()

    labels = check_inclusion(completion.choices[0].message.content.split(','), testClass)
    # set_labels(labels, filtered_dto_image_pairs)
    labels_to_ids = get_labels_to_ids(labels, filtered_dto_image_pairs)
    labels_and_ids = [{'label': label, 'ids': ids} for label, ids in labels_to_ids.items()]

    return labels_and_ids


@app.route('/')
def hello_world():
    api_key = request.headers.get('x-api-key')
    if not api_key or api_key != API_KEY:
        return jsonify({'message': 'Invalid API key'}), 403

    return 'Hello, World!'


@app.route('/health', methods=['GET'])
def health_check():
    return 'OK', 200


if __name__ == '__main__':
    app.run()
