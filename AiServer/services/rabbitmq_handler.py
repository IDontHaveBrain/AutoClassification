import json
import threading
import time
import logging
import pika
from config import config
from services.data_processor import DataProcessor


class RabbitMQConnection:
    """RabbitMQ 연결을 관리하는 싱글톤 클래스."""

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
        """
        RabbitMQ 채널을 가져오거나 생성합니다.

        Returns:
            pika.channel.Channel: RabbitMQ 채널 객체.

        Raises:
            pika.exceptions.AMQPConnectionError: 최대 재시도 횟수 후 연결 실패 시 발생.
        """
        if self._connection is None or self._connection.is_closed:
            retry_count = 0
            max_retries = 5
            while retry_count < max_retries:
                try:
                    self._connection = pika.BlockingConnection(
                        pika.ConnectionParameters(
                            host=config.RABBITMQ_HOST,
                            port=config.RABBITMQ_PORT,
                            heartbeat=600,
                            blocked_connection_timeout=300,
                        )
                    )
                    self._channel = self._connection.channel()
                    self._channel.queue_declare(
                        queue=config.RABBITMQ_RESPONSE_QUEUE, durable=True
                    )
                    break
                except pika.exceptions.AMQPConnectionError as e:
                    retry_count += 1
                    if retry_count == max_retries:
                        raise e
                    time.sleep(5)
        return self._channel


class RabbitMQHandler:
    """RabbitMQ 작업을 처리하는 핸들러 클래스."""

    @staticmethod
    def send_response_to_queue(correlation_id, response_data):
        """
        RabbitMQ 큐에 응답을 전송합니다.

        Args:
            correlation_id (str): 메시지의 상관 ID.
            response_data (dict): 전송할 응답 데이터.

        Raises:
            pika.exceptions.AMQPError: 메시지 전송 중 오류 발생 시.
        """
        channel = RabbitMQConnection().get_channel()
        message = json.dumps(response_data)
        try:
            channel.basic_publish(
                exchange="",
                routing_key=config.RABBITMQ_RESPONSE_QUEUE,
                body=message,
                properties=pika.BasicProperties(
                    delivery_mode=2, correlation_id=correlation_id
                ),
            )
            logging.info(
                f" [x] ClassifyResponseQueue에 응답 전송 완료. 상관 ID: {correlation_id}"
            )
        except pika.exceptions.AMQPError as e:
            logging.error(f"RabbitMQ에 메시지 전송 실패: {e}")
            raise

    @staticmethod
    def process_data_wrapper(ch, method, properties, body):
        """
        수신되는 RabbitMQ 메시지를 처리하는 래퍼 메서드.

        Args:
            ch (pika.channel.Channel): 채널 객체.
            method (pika.spec.Basic.Deliver): 메서드 프레임.
            properties (pika.spec.BasicProperties): 메시지의 속성.
            body (bytes): 메시지 본문.
        """
        try:
            print(" [x] Received")
            message = json.loads(body.decode("utf-8"))
            message = json.loads(message)

            class DummyRequest:
                def __init__(self, json_data):
                    self.json = json_data
                    self.headers = {"x-api-key": config.API_KEY}

            dummy_request = DummyRequest(message)
            data = dummy_request.json

            ch.basic_ack(delivery_tag=method.delivery_tag)
            operation = "auto"
            labels_and_ids = DataProcessor.process_data(dummy_request, operation)
            result = {
                "requesterId": data.get("requesterId"),
                "workspaceId": data.get("workspaceId"),
                "labelsAndIds": labels_and_ids,
            }

            RabbitMQHandler.send_response_to_queue(properties.correlation_id, result)

        except pika.exceptions.StreamLostError:
            print("Connection lost, attempting to reconnect...")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)
        except Exception as e:
            print(f"Unexpected error occurred: {e}")
            ch.basic_ack(delivery_tag=method.delivery_tag)
