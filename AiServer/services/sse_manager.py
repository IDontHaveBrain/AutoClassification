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
    def _ensure_initialized(cls):
        """Ensure the singleton instance is properly initialized"""
        if cls._instance is None:
            cls()  # This will trigger __new__ and initialize the singleton
        return cls._instance

    @classmethod
    def register_client(cls, client_id):
        instance = cls._ensure_initialized()
        if client_id not in instance.clients:
            instance.clients[client_id] = Queue()

    @classmethod
    def unregister_client(cls, client_id):
        instance = cls._ensure_initialized()
        if client_id in instance.clients:
            del instance.clients[client_id]

    @classmethod
    def send_event(cls, client_id, event, data):
        instance = cls._ensure_initialized()
        if client_id in instance.clients:
            instance.clients[client_id].put(json.dumps({
                'event': event,
                'data': data
            }))

    @classmethod
    def event_stream(cls, client_id):
        instance = cls._ensure_initialized()
        try:
            while True:
                if client_id in instance.clients:
                    message = instance.clients[client_id].get()
                    yield f"data: {message}\n\n"
                else:
                    break
        finally:
            cls.unregister_client(client_id)

    @classmethod
    def sse_response(cls, client_id):
        cls._ensure_initialized()  # Ensure initialization before creating response
        return Response(cls.event_stream(client_id), content_type='text/event-stream')
