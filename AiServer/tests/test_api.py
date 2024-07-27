import unittest
from flask import json
from app import app
from config import config

class TestAPI(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True
        self.api_key = config.API_KEY

    def test_health_check(self):
        response = self.app.get('/health')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data.decode(), '정상')

    def test_hello_world_with_valid_api_key(self):
        response = self.app.get('/', headers={'x-api-key': self.api_key})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data.decode(), '안녕하세요, 세계!')

    def test_hello_world_with_invalid_api_key(self):
        response = self.app.get('/', headers={'x-api-key': 'invalid_key'})
        self.assertEqual(response.status_code, 403)
        data = json.loads(response.data.decode())
        self.assertEqual(data['message'], '유효하지 않은 API 키')

    def test_classify_data(self):
        test_data = {
            'workspaceId': 1,
            'testClass': ['cat', 'dog'],
            'testImages': [
                {'id': '1', 'url': 'http://example.com/cat.jpg'},
                {'id': '2', 'url': 'http://example.com/dog.jpg'}
            ]
        }
        response = self.app.post('/api/classify', 
                                 headers={'x-api-key': self.api_key, 'Content-Type': 'application/json'},
                                 data=json.dumps(test_data))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data.decode())
        self.assertIsInstance(data, list)
        self.assertTrue(all('label' in item and 'ids' in item for item in data))

    def test_test_classify_data(self):
        test_data = {
            'workspaceId': 1,
            'testClass': ['cat', 'dog'],
            'testImages': [
                {'id': '1', 'url': 'http://example.com/cat.jpg'},
                {'id': '2', 'url': 'http://example.com/dog.jpg'}
            ]
        }
        response = self.app.post('/api/testclassify', 
                                 headers={'x-api-key': self.api_key, 'Content-Type': 'application/json'},
                                 data=json.dumps(test_data))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data.decode())
        self.assertIsInstance(data, list)
        self.assertTrue(all('label' in item and 'ids' in item for item in data))

    def test_train_data(self):
        test_data = {
            'workspaceId': 1
        }
        response = self.app.post('/api/train', 
                                 headers={'x-api-key': self.api_key, 'Content-Type': 'application/json'},
                                 data=json.dumps(test_data))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data.decode())
        self.assertEqual(data['message'], '데이터 훈련 중...')

if __name__ == '__main__':
    unittest.main()
