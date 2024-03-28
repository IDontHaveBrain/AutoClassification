import pika

import config
from RabbitMq import RabbitMQHandler


class Consumer:
    _is_consumer_thread_started = False
    connection = None

    @staticmethod
    def start_consumer():
        if Consumer._is_consumer_thread_started:
            return

        Consumer._is_consumer_thread_started = True
        while True:
            try:
                if Consumer.connection is None or Consumer.connection.is_closed:
                    Consumer.connection = pika.BlockingConnection(
                        pika.ConnectionParameters(config.RABBITMQ_HOST, config.RABBITMQ_PORT))
                channel = Consumer.connection.channel()
                channel.queue_declare(queue=config.RABBITMQ_RESPONSE_QUEUE, durable=True)

                channel.basic_qos(prefetch_count=1)
                channel.basic_consume(queue=config.RABBITMQ_QUEUE,
                                      on_message_callback=RabbitMQHandler.process_data_wrapper)

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