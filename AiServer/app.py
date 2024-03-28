import threading

from flask import Flask, request, jsonify

import config
from Consumer import Consumer
from DataProcessor import DataProcessor

app = Flask(__name__)

@app.route('/api/classify', methods=['POST'])
def classify_data():
    return jsonify(DataProcessor.process_data(request, 'classify')), 200

@app.route('/api/testclassfiy', methods=['POST'])
def test_data():
    return jsonify(DataProcessor.process_data(request, 'test')), 200

@app.route('/')
def hello_world():
    api_key = request.headers.get('x-api-key')
    if not api_key or api_key != config.API_KEY:
        return jsonify({'message': 'Invalid API key'}), 403

    return 'Hello, World!'

@app.route('/health', methods=['GET'])
def health_check():
    return 'OK', 200

def start_flask():
    app.run(host='0.0.0.0', port=5000)

if __name__ == '__main__':
    flask_thread = threading.Thread(target=start_flask)
    flask_thread.start()
    Consumer.start_consumer()