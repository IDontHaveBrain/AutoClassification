import threading
import signal
import sys
from flask import Flask
from config import Config
from services.consumer import Consumer
from api.routes import api_bp
from api.error_handlers import register_error_handlers

# Initialize Flask application
app = Flask(__name__)
app.config.from_object(Config)
app.register_blueprint(api_bp)
register_error_handlers(app)

def start_flask():
    """
    Start the Flask application.
    """
    app.run(debug=False, host="0.0.0.0", port=5000, use_reloader=False)

def signal_handler(sig, frame):
    print('You pressed Ctrl+C!')
    sys.exit(0)

if __name__ == "__main__":
    # Set up signal handler in the main thread
    signal.signal(signal.SIGINT, signal_handler)
    
    # Start Flask in a separate thread
    flask_thread = threading.Thread(target=start_flask)
    flask_thread.start()

    try:
        # Start the RabbitMQ consumer
        Consumer.start_consumer()
    except KeyboardInterrupt:
        print("Shutting down...")
    finally:
        # Perform any cleanup if needed
        pass
