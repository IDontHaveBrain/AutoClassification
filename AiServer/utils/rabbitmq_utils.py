import json
import pika
from config import config

class RabbitMQConnection:
    _instance = None

    def __new__(cls):
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
        exchange='',
        routing_key=config.RABBITMQ_RESPONSE_QUEUE,
        body=message,
        properties=pika.BasicProperties(
            delivery_mode=2,
        ))
    print(" [x] Sent response to ClassfiyResponseQueue")
