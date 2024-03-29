import json
import threading

import pika

import config
from DataProcessor import DataProcessor


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

class RabbitMQHandler:
    @staticmethod
    def send_response_to_queue(correlation_id, response_data):
        channel = RabbitMQConnection().get_channel()
        message = json.dumps(response_data)
        channel.basic_publish(
            exchange='',
            routing_key=config.RABBITMQ_RESPONSE_QUEUE,
            body=message,
            properties=pika.BasicProperties(
                # correlation_id=correlation_id,
                delivery_mode=2,
            ))
        print(" [x] Sent response to ClassfiyResponseQueue")

    @staticmethod
    def process_data_wrapper(ch, method, properties, body):
        try:
            print(" [x] Received")
            message = json.loads(body.decode('utf-8'))
            message = json.loads(message)

            class DummyRequest:
                def __init__(self, json_data):
                    self.json = json_data
                    self.headers = {'x-api-key': config.API_KEY}

            dummy_request = DummyRequest(message)
            data = dummy_request.json

            operation = 'auto'
            labels_and_ids = DataProcessor.process_data(dummy_request, operation, properties)
            result = {
                'requesterId': data.get('requesterId'),
                'workspaceId': data.get('workspaceId'),
                'labelsAndIds': labels_and_ids
            }

            RabbitMQHandler.send_response_to_queue(properties.correlation_id, result)
            ch.basic_ack(delivery_tag=method.delivery_tag)

        except pika.exceptions.StreamLostError:
            print("Connection lost, attempting to reconnect...")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)
        except Exception as e:
            print(f"Unexpected error occurred: {e}")
            ch.basic_ack(delivery_tag=method.delivery_tag)