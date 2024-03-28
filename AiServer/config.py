# config.py
import os

RABBITMQ_HOST = 'dev.nobrain.cc'
RABBITMQ_PORT = 5672
RABBITMQ_QUEUE = 'ClassfiyQueue'
RABBITMQ_RESPONSE_QUEUE = 'ClassfiyResponseQueue'
RABBITMQ_EXCHANGE = 'ClassfiyExchange'
BASE_DIR = "C:/AutoClass" if os.name == 'nt' else "/data/autoClass"
API_KEY = "test"