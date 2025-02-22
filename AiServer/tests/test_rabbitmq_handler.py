import unittest
from unittest.mock import patch, MagicMock
from services.rabbitmq_handler import RabbitMQConnection, RabbitMQHandler
from pika.exceptions import AMQPConnectionError
import json

class TestRabbitMQConnection(unittest.TestCase):
    @patch('services.rabbitmq_handler.pika.BlockingConnection')
    def test_get_channel(self, mock_connection):
        connection = RabbitMQConnection()
        mock_channel = MagicMock()
        mock_connection.return_value.channel.return_value = mock_channel

        channel = connection.get_channel()

        self.assertEqual(channel, mock_channel)
        mock_connection.assert_called_once()

    @patch('services.rabbitmq_handler.pika.BlockingConnection')
    def test_connection_error(self, mock_connection):
        connection = RabbitMQConnection()
        mock_connection.side_effect = AMQPConnectionError("Connection error")

        with self.assertRaises(AMQPConnectionError):
            connection.get_channel()

    @patch('services.rabbitmq_handler.pika.BlockingConnection')
    def test_check_connection(self, mock_connection):
        connection = RabbitMQConnection()
        mock_connection.return_value.is_open = True

        self.assertTrue(connection.check_connection())

class TestRabbitMQHandler(unittest.TestCase):
    @patch('services.rabbitmq_handler.RabbitMQConnection')
    def test_send_response_to_queue(self, mock_connection):
        handler = RabbitMQHandler()
        mock_channel = MagicMock()
        mock_connection.return_value.get_channel.return_value = mock_channel

        correlation_id = "test_correlation_id"
        response_data = {"test": "data"}

        handler.send_response_to_queue(correlation_id, response_data)

        mock_channel.basic_publish.assert_called_once()

    @patch('services.rabbitmq_handler.RabbitMQHandler._parse_message')
    @patch('services.rabbitmq_handler.ImageService')
    @patch('services.rabbitmq_handler.YOLOService')
    def test_process_train_wrapper(self, mock_yolo_service, mock_image_service, mock_parse_message):
        handler = RabbitMQHandler()
        mock_ch = MagicMock()
        mock_method = MagicMock()
        mock_properties = MagicMock()
        mock_body = MagicMock()

        mock_parse_message.return_value = {
            "workspaceId": 1,
            "requesterId": "test_requester"
        }
        mock_yolo_service.return_value.train.return_value = {"test": "result"}

        handler.process_train_wrapper(mock_ch, mock_method, mock_properties, mock_body)

        mock_image_service.organize_workspace_images.assert_called_once()
        mock_yolo_service.return_value.train.assert_called_once()
        mock_ch.basic_ack.assert_called_once()

    def test_create_train_response(self):
        handler = RabbitMQHandler()
        message = {
            "requesterId": "test_requester",
            "workspaceId": 1
        }
        train_result = {"accuracy": 0.95}

        response = handler._create_train_response(message, train_result)

        self.assertEqual(response["requesterId"], "test_requester")
        self.assertEqual(response["workspaceId"], 1)
        self.assertEqual(response["trainResult"], train_result)

if __name__ == '__main__':
    unittest.main()
