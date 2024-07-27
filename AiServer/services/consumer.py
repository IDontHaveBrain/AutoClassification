import pika
import time
import logging
from config import config
from services.rabbitmq_handler import RabbitMQHandler
from exceptions.custom_exceptions import RabbitMQConnectionError

logger = logging.getLogger(__name__)

class Consumer:
    """
    RabbitMQ 메시지 소비를 처리하는 소비자 클래스.

    이 클래스는 RabbitMQ 서버에 연결하고 메시지를 소비하는 기능을 제공합니다.
    연결 오류 및 재시도 로직을 포함하고 있어 안정적인 메시지 소비를 보장합니다.

    Attributes:
        _is_consumer_thread_started (bool): 소비자 스레드의 시작 여부를 나타내는 플래그.
        connection (pika.BlockingConnection): RabbitMQ 서버와의 연결 객체.
    """

    _is_consumer_thread_started = False
    connection = None

    @staticmethod
    def start_consumer():
        """
        RabbitMQ 소비자를 시작합니다.

        이 메서드는 RabbitMQ에 연결을 설정하고, 필요한 큐를 선언한 후,
        메시지 소비를 시작합니다. 연결 손실 시 재연결을 처리하며,
        중단될 때까지 계속 실행됩니다.

        Note:
            이 메서드는 무한 루프로 실행되며, KeyboardInterrupt로 중단될 수 있습니다.
        """
        if Consumer._is_consumer_thread_started:
            return

        Consumer._is_consumer_thread_started = True
        retry_interval = 5  # seconds
        max_retries = 5
        retry_count = 0

        while True:
            try:
                if Consumer.connection is None or Consumer.connection.is_closed:
                    Consumer.connection = Consumer._create_connection()

                channel = Consumer.connection.channel()
                
                # Declare both queues
                channel.queue_declare(queue=config.RABBITMQ_QUEUE, durable=True)
                channel.queue_declare(queue=config.RABBITMQ_RESPONSE_QUEUE, durable=True)

                channel.basic_qos(prefetch_count=1)
                channel.basic_consume(
                    queue=config.RABBITMQ_QUEUE,
                    on_message_callback=RabbitMQHandler.process_data_wrapper,
                    auto_ack=False,
                )

                logger.info(" [*] Waiting for messages. To exit press CTRL+C")
                channel.start_consuming()

            except pika.exceptions.AMQPConnectionError as e:
                logger.warning(f"Connection error: {e}. Retrying in {retry_interval} seconds...")
                Consumer._handle_connection_error(retry_interval, max_retries, retry_count)
                retry_count += 1

            except pika.exceptions.ChannelClosedByBroker as e:
                logger.warning(f"Channel closed by broker: {e}. Retrying in {retry_interval} seconds...")
                Consumer._handle_connection_error(retry_interval, max_retries, retry_count)
                retry_count += 1

            except KeyboardInterrupt:
                logger.info("Exiting consumer thread...")
                break

            except Exception as e:
                logger.error(f"Unexpected error occurred: {e}. Retrying in {retry_interval} seconds...")
                Consumer._handle_connection_error(retry_interval, max_retries, retry_count)
                retry_count += 1

    @staticmethod
    def _create_connection():
        """
        RabbitMQ 연결을 생성합니다.

        Returns:
            pika.BlockingConnection: RabbitMQ 연결 객체

        Raises:
            RabbitMQConnectionError: 연결 생성 실패 시 발생

        Note:
            이 메서드는 연결 파라미터를 설정하고 RabbitMQ 서버와의 연결을 시도합니다.
        """
        try:
            return pika.BlockingConnection(
                pika.ConnectionParameters(
                    host=config.RABBITMQ_HOST,
                    port=config.RABBITMQ_PORT,
                    heartbeat=600,
                    blocked_connection_timeout=300,
                    connection_attempts=3,
                    retry_delay=5,
                )
            )
        except pika.exceptions.AMQPConnectionError as e:
            logger.error(f"Failed to create RabbitMQ connection: {e}")
            raise RabbitMQConnectionError("Failed to create RabbitMQ connection") from e

    @staticmethod
    def _handle_connection_error(retry_interval, max_retries, retry_count):
        """
        연결 오류를 처리합니다.

        이 메서드는 연결 오류 발생 시 재시도 로직을 구현합니다.
        지수 백오프 알고리즘을 사용하여 재시도 간격을 조정합니다.

        Args:
            retry_interval (int): 기본 재시도 간격 (초)
            max_retries (int): 최대 재시도 횟수
            retry_count (int): 현재 재시도 횟수

        Raises:
            RabbitMQConnectionError: 최대 재시도 횟수 초과 시 발생

        Note:
            재시도 간격은 지수적으로 증가하며, 최대 60초로 제한됩니다.
        """
        if retry_count >= max_retries:
            logger.error(f"Max retries ({max_retries}) exceeded. Stopping consumer.")
            raise RabbitMQConnectionError("Max retries exceeded")
        
        wait_time = min(60, retry_interval * (2 ** retry_count))  # 지수 백오프 적용, 최대 60초
        logger.info(f"Retrying in {wait_time} seconds... (Attempt {retry_count + 1}/{max_retries})")
        time.sleep(wait_time)
