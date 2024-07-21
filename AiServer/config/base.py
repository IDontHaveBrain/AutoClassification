import os

class BaseConfig:
    """Base configuration."""
    SECRET_KEY = os.getenv('SECRET_KEY', 'my_precious_secret_key')
    DEBUG = False
    TESTING = False
    RABBITMQ_HOST = os.getenv('RABBITMQ_HOST', 'dev.nobrain.cc')
    RABBITMQ_PORT = int(os.getenv('RABBITMQ_PORT', 5672))
    RABBITMQ_QUEUE = os.getenv('RABBITMQ_QUEUE', 'ClassifyQueue')
    RABBITMQ_RESPONSE_QUEUE = os.getenv('RABBITMQ_RESPONSE_QUEUE', 'ClassifyResponseQueue')
    RABBITMQ_EXCHANGE = os.getenv('RABBITMQ_EXCHANGE', 'ClassifyExchange')
    BASE_DIR = os.getenv('BASE_DIR', 'C:/AutoClass' if os.name == 'nt' else '/data/autoClass')
    API_KEY = os.getenv('API_KEY', 'test')
