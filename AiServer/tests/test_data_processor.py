import unittest
from unittest.mock import patch, MagicMock
from services.data_processor import DataProcessor
from flask import Flask, jsonify

class TestDataProcessor(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.config['TESTING'] = True

    @patch('services.data_processor.ImageProcessor')
    @patch('services.data_processor.asyncio.run')
    def test_process_data(self, mock_asyncio_run, mock_image_processor):
        mock_image_processor.is_url_image.return_value = True
        mock_asyncio_run.return_value = {'cat': ['1', '2'], 'dog': ['3']}

        with self.app.test_request_context(json={
            'workspaceId': 1,
            'testClass': ['cat', 'dog'],
            'testImages': [
                {'id': '1', 'url': 'http://example.com/cat1.jpg'},
                {'id': '2', 'url': 'http://example.com/cat2.jpg'},
                {'id': '3', 'url': 'http://example.com/dog.jpg'}
            ]
        }, headers={'x-api-key': 'test'}):
            result = DataProcessor.process_data(MagicMock(), 'test')

        expected_result = [
            {'label': 'cat', 'ids': ['1', '2']},
            {'label': 'dog', 'ids': ['3']}
        ]
        self.assertEqual(result, expected_result)

    @patch('services.data_processor.AsyncOpenAI')
    async def test_classify_images_with_tools(self, mock_openai):
        mock_response = MagicMock()
        mock_response.choices[0].message.tool_calls[0].function.name = "classify_images"
        mock_response.choices[0].message.tool_calls[0].function.arguments = '{"classifications": [{"index": 0, "category": "cat"}, {"index": 1, "category": "dog"}]}'
        mock_openai.return_value.chat.completions.create.return_value = mock_response

        client = MagicMock()
        images = [("data:image/jpeg;base64,abc", "http://example.com/cat.jpg"), ("data:image/jpeg;base64,def", "http://example.com/dog.jpg")]
        categories = ["cat", "dog"]

        result = await DataProcessor.classify_images_with_tools(client, images, categories)

        self.assertEqual(result, mock_response)

    def test_parse_tool_response(self):
        mock_response = MagicMock()
        mock_response.choices[0].message.tool_calls[0].function.name = "classify_images"
        mock_response.choices[0].message.tool_calls[0].function.arguments = '{"classifications": [{"index": 0, "category": "cat"}, {"index": 1, "category": "dog"}]}'

        result = DataProcessor.parse_tool_response(mock_response, ["cat", "dog", "bird"], 2)

        self.assertEqual(result, ["cat", "dog"])

if __name__ == '__main__':
    unittest.main()
