import unittest
from unittest.mock import patch, MagicMock
from services.sse_manager import SSEManager
from flask import Flask
import json
import time

class TestSSEManager(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.client = self.app.test_client()
        self.sse_manager = SSEManager()

    def test_register_client(self):
        client_id = "test_client"
        SSEManager.register_client(client_id)
        self.assertIn(client_id, self.sse_manager.clients)

    def test_unregister_client(self):
        client_id = "test_client"
        SSEManager.register_client(client_id)
        SSEManager.unregister_client(client_id)
        self.assertNotIn(client_id, self.sse_manager.clients)

    def test_send_event(self):
        client_id = "test_client"
        event = "test_event"
        data = "test_data"
        SSEManager.register_client(client_id)
        SSEManager.send_event(client_id, event, data)
        
        message = self.sse_manager.clients[client_id].get()
        parsed_message = json.loads(message)
        self.assertEqual(parsed_message['event'], event)
        self.assertEqual(parsed_message['data'], data)

    @patch('services.sse_manager.Response')
    def test_sse_response(self, mock_response):
        client_id = "test_client"
        SSEManager.register_client(client_id)
        
        with self.app.app_context():
            SSEManager.sse_response(client_id)
        
        mock_response.assert_called_once()

    def test_event_stream(self):
        client_id = "test_client"
        SSEManager.register_client(client_id)
        SSEManager.send_event(client_id, "test_event", "test_data")

        generator = SSEManager.event_stream(client_id)
        message = next(generator)
        
        self.assertIn("data:", message)
        parsed_data = json.loads(message.split("data: ")[1])
        self.assertEqual(parsed_data['event'], "test_event")
        self.assertEqual(parsed_data['data'], "test_data")

    def test_multiple_clients(self):
        client_ids = ["client1", "client2", "client3"]
        for client_id in client_ids:
            SSEManager.register_client(client_id)
            SSEManager.send_event(client_id, f"event_{client_id}", f"data_{client_id}")

        for client_id in client_ids:
            message = self.sse_manager.clients[client_id].get()
            parsed_message = json.loads(message)
            self.assertEqual(parsed_message['event'], f"event_{client_id}")
            self.assertEqual(parsed_message['data'], f"data_{client_id}")

    def test_client_timeout(self):
        client_id = "timeout_client"
        SSEManager.register_client(client_id)
        
        # Simulate a timeout
        time.sleep(2)
        
        generator = SSEManager.event_stream(client_id)
        with self.assertRaises(StopIteration):
            next(generator)

        self.assertNotIn(client_id, self.sse_manager.clients)

    def tearDown(self):
        # Clean up all registered clients
        for client_id in list(self.sse_manager.clients.keys()):
            SSEManager.unregister_client(client_id)

if __name__ == '__main__':
    unittest.main()
