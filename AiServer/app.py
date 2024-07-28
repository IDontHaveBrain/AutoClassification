import threading
import signal
import sys
import time
from flask import Flask
from config import Config
from services.consumer import Consumer
from api.routes import api_bp
from api.error_handlers import register_error_handlers

app = Flask(__name__)
app.config.from_object(Config)
app.register_blueprint(api_bp)
register_error_handlers(app)

shutdown_event = threading.Event()
consumer_thread_stopped = threading.Event()

def start_flask():
    """Flask 애플리케이션을 시작합니다."""
    app.run(debug=False, host="0.0.0.0", port=5000, use_reloader=False)

def graceful_shutdown():
    """애플리케이션의 종료 프로세스를 처리합니다."""
    print('Application shutting down...')
    shutdown_event.set()
    consumer_thread_stopped.wait(timeout=10)
    print('Shutdown complete.')

def signal_handler(sig, frame):
    print('Signal received, initiating shutdown...')
    graceful_shutdown()

def check_consumer_thread(consumer_thread):
    """소비자 스레드의 상태를 확인하고 소비자가 중지된 경우 애플리케이션을 종료합니다."""
    while not shutdown_event.is_set():
        if not consumer_thread.is_alive():
            print("Consumer thread has stopped. Initiating application shutdown...")
            graceful_shutdown()
            break
        time.sleep(5)

if __name__ == "__main__":
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    flask_thread = threading.Thread(target=start_flask)
    flask_thread.start()

    consumer_thread = threading.Thread(target=Consumer.start_consumer, args=(shutdown_event, consumer_thread_stopped))
    consumer_thread.start()

    monitor_thread = threading.Thread(target=check_consumer_thread, args=(consumer_thread,))
    monitor_thread.start()

    try:
        # 메인 스레드는 여기서 대기합니다.
        while not shutdown_event.is_set():
            time.sleep(1)
    except KeyboardInterrupt:
        print("Keyboard interrupt received")
    finally:
        graceful_shutdown()
        consumer_thread.join(timeout=10)
        if consumer_thread.is_alive():
            print("Warning: The Consumer thread did not terminate normally.")
        monitor_thread.join()
        flask_thread.join()
