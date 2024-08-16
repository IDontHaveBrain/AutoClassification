import logging
from config import config
from services.rabbitmq_handler import RabbitMQHandler
from services.rabbitmq_handler import RabbitMQConnection
from exceptions.custom_exceptions import RabbitMQConnectionError

logger = logging.getLogger(__name__)

class Consumer:
    """RabbitMQ 메시지 소비를 처리하는 소비자 클래스."""

    _is_consumer_thread_started = False

    @staticmethod
    def start_consumer(shutdown_event, consumer_thread_stopped):
        """RabbitMQ 소비자를 시작합니다."""
        if Consumer._is_consumer_thread_started:
            return

        Consumer._is_consumer_thread_started = True
        connection = RabbitMQConnection()
        logger.info(" [*] Consumer thread started.")

        try:
            while not shutdown_event.is_set():
                try:
                    channel = connection.get_channel()
                    
                    queue_name = config.RABBITMQ_QUEUE
                    channel.queue_declare(queue=queue_name, durable=True)
                    channel.basic_qos(prefetch_count=1)
                    rabbitmq_handler = RabbitMQHandler()
                    channel.basic_consume(
                        queue=queue_name,
                        on_message_callback=rabbitmq_handler.process_data_wrapper,
                        auto_ack=False,
                    )

                    logger.info(" [*] Waiting for messages. To exit press CTRL+C")
                
                    while not shutdown_event.is_set():
                        connection.check_connection()
                        connection._connection.process_data_events(time_limit=1)

                except RabbitMQConnectionError as e:
                    if shutdown_event.is_set():
                        break
                    logger.warning(f"Connection error: {e}. Attempting to reconnect...")
                    connection.check_connection()

        except KeyboardInterrupt:
            logger.info("Keyboard interrupt received. Exiting consumer thread...")

        except Exception as e:
            logger.error(f"Fatal error in consumer thread: {e}. Consumer thread will terminate.")

        finally:
            logger.info("Consumer thread is shutting down...")
            connection.close()
            consumer_thread_stopped.set()
            logger.info("Consumer thread has stopped.")
