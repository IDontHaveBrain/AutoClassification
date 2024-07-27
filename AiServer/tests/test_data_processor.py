import unittest
from unittest.mock import patch, MagicMock
from services.data_processor import DataProcessor
from flask import Flask
from config import config

class TestDataProcessor(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.config['TESTING'] = True
        self.data_processor = DataProcessor()

    @patch('services.data_processor.ImageService')
    @patch('services.data_processor.asyncio.run')
    def test_process_data(self, mock_asyncio_run, mock_image_service):
        mock_image_service.is_url_image.return_value = True
        mock_asyncio_run.return_value = {'cat': ['1', '2'], 'dog': ['3']}

        with self.app.test_request_context(json={
            'workspaceId': 1,
            'testClass': ['cat', 'dog'],
            'testImages': [
                {'id': '1', 'url': 'http://example.com/cat1.jpg'},
                {'id': '2', 'url': 'http://example.com/cat2.jpg'},
                {'id': '3', 'url': 'http://example.com/dog.jpg'}
            ]
        }, headers={'x-api-key': config.API_KEY}):
            result = self.data_processor.process_data(MagicMock(), 'test')

        expected_result = [
            {'label': 'cat', 'ids': ['1', '2']},
            {'label': 'dog', 'ids': ['3']}
        ]
        self.assertEqual(result, expected_result)

    @patch('services.data_processor.ClassificationService.classify_images')
    async def test_process_chunks(self, mock_classify_images):
        mock_classify_images.return_value = ['cat', 'dog']
        chunks = [[({'id': '1'}, 'http://example.com/cat.jpg'), 
                   ({'id': '2'}, 'http://example.com/dog.jpg')]]
        test_class = ['cat', 'dog']
        operation = 'test'
        workspace_id = 1

        result = await self.data_processor._process_chunks(chunks, test_class, operation, workspace_id)

        expected_result = {'cat': ['1'], 'dog': ['2']}
        self.assertEqual(result, expected_result)

    def test_chunk_list(self):
        test_list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        result = list(self.data_processor._chunk_list(test_list, 3))
        expected_result = [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]
        self.assertEqual(result, expected_result)

if __name__ == '__main__':
    unittest.main()
