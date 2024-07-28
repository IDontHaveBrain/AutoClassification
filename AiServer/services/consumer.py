import pika
import time
import logging
from config import config
from services.rabbitmq_handler import RabbitMQHandler
from exceptions.custom_exceptions import RabbitMQConnectionError

logger = logging.getLogger(__name__)

class Consumer:
    """RabbitMQ 메시지 소비를 처리하는 소비자 클래스."""

    _is_consumer_thread_started = False
    connection = None

    @staticmethod
    def start_consumer(shutdown_event, consumer_thread_stopped):
        """RabbitMQ 소비자를 시작합니다."""
        if Consumer._is_consumer_thread_started:
            return

        Consumer._is_consumer_thread_started = True
        retry_interval = 5
        max_retries = 5
        retry_count = 0

        try:
            while not shutdown_event.is_set():
                try:
                    if Consumer.connection is None or Consumer.connection.is_closed:
                        Consumer.connection = Consumer._create_connection()

                    channel = Consumer.connection.channel()
                
                    channel.queue_declare(queue=config.RABBITMQ_QUEUE, durable=True)
                    channel.queue_declare(queue=config.RABBITMQ_RESPONSE_QUEUE, durable=True)

                    channel.basic_qos(prefetch_count=1)
                    channel.basic_consume(
                        queue=config.RABBITMQ_QUEUE,
                        on_message_callback=RabbitMQHandler.process_data_wrapper,
                        auto_ack=False,
                    )

                    logger.info(" [*] Waiting for messages. To exit press CTRL+C")
                
                    while not shutdown_event.is_set():
                        if Consumer.connection is None or Consumer.connection.is_closed:
                            logger.warning("Connection is closed or None. Attempting to reconnect...")
                            Consumer.connection = Consumer._create_connection()
                            channel = Consumer.connection.channel()
                            channel.queue_declare(queue=config.RABBITMQ_QUEUE, durable=True)
                            channel.queue_declare(queue=config.RABBITMQ_RESPONSE_QUEUE, durable=True)
                            channel.basic_qos(prefetch_count=1)
                            channel.basic_consume(
                                queue=config.RABBITMQ_QUEUE,
                                on_message_callback=RabbitMQHandler.process_data_wrapper,
                                auto_ack=False,
                            )
                        Consumer.connection.process_data_events(time_limit=1)

                except pika.exceptions.AMQPConnectionError as e:
                    if shutdown_event.is_set():
                        break
                    logger.warning(f"Connection error: {e}. Retrying in {retry_interval} seconds...")
                    Consumer._handle_connection_error(retry_interval, max_retries, retry_count)
                    retry_count += 1

                except pika.exceptions.ChannelClosedByBroker as e:
                    if shutdown_event.is_set():
                        break
                    logger.warning(f"Channel closed by broker: {e}. Retrying in {retry_interval} seconds...")
                    Consumer._handle_connection_error(retry_interval, max_retries, retry_count)
                    retry_count += 1

                except Exception as e:
                    logger.error(f"Unexpected error occurred: {e}. Consumer thread will terminate.")
                    break

        except KeyboardInterrupt:
            logger.info("Keyboard interrupt received. Exiting consumer thread...")

        except Exception as e:
            logger.error(f"Fatal error in consumer thread: {e}. Consumer thread will terminate.")

        finally:
            logger.info("Consumer thread is shutting down...")
            if Consumer.connection and not Consumer.connection.is_closed:
                Consumer.connection.close()
            consumer_thread_stopped.set()
            logger.info("Consumer thread has stopped.")

    @staticmethod
    def _create_connection():
        """RabbitMQ 연결을 생성합니다."""
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
        """연결 오류를 처리합니다."""
        if retry_count >= max_retries:
            logger.error(f"Max retries ({max_retries}) exceeded. Stopping consumer.")
            raise RabbitMQConnectionError("Max retries exceeded")
        
        wait_time = min(60, retry_interval * (2 ** retry_count))
        logger.info(f"Retrying in {wait_time} seconds... (Attempt {retry_count + 1}/{max_retries})")
        time.sleep(wait_time)
