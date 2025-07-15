from flask import Response
from queue import Queue
import json
import threading

class SSEManager:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super(SSEManager, cls).__new__(cls)
                    cls._instance.clients = {}
        return cls._instance

    @classmethod
    def register_client(cls, client_id):
        if client_id not in cls._instance.clients:
            cls._instance.clients[client_id] = Queue()

    @classmethod
    def unregister_client(cls, client_id):
        if client_id in cls._instance.clients:
            del cls._instance.clients[client_id]

    @classmethod
    def send_event(cls, client_id, event, data):
        if client_id in cls._instance.clients:
            cls._instance.clients[client_id].put(json.dumps({
                'event': event,
                'data': data
            }))

    @classmethod
    def event_stream(cls, client_id):
        try:
            while True:
                if client_id in cls._instance.clients:
                    message = cls._instance.clients[client_id].get()
                    yield f"data: {message}\n\n"
                else:
                    break
        finally:
            cls.unregister_client(client_id)

    @classmethod
    def sse_response(cls, client_id):
        return Response(cls.event_stream(client_id), content_type='text/event-stream')
