import pika
import time
from config import config
from services.rabbitmq_handler import RabbitMQHandler


class Consumer:
    """
    RabbitMQ 메시지 소비를 처리하는 소비자 클래스.
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
        """
        if Consumer._is_consumer_thread_started:
            return

        Consumer._is_consumer_thread_started = True
        retry_interval = 5  # seconds
        while True:
            try:
                if Consumer.connection is None or Consumer.connection.is_closed:
                    Consumer.connection = pika.BlockingConnection(
                        pika.ConnectionParameters(
                            config.RABBITMQ_HOST, config.RABBITMQ_PORT
                        )
                    )
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

                print(" [*] Waiting for messages. To exit press CTRL+C")
                channel.start_consuming()
            except pika.exceptions.AMQPConnectionError:
                print(f"Connection error. Retrying in {retry_interval} seconds...")
                time.sleep(retry_interval)
            except pika.exceptions.ChannelClosedByBroker:
                print(f"Channel closed by broker. Retrying in {retry_interval} seconds...")
                time.sleep(retry_interval)
            except KeyboardInterrupt:
                print("Exiting consumer thread...")
                break
            except Exception as e:
                print(f"Unexpected error occurred: {e}. Retrying in {retry_interval} seconds...")
                time.sleep(retry_interval)
