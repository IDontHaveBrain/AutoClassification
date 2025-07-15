import unittest
from unittest.mock import patch, MagicMock
import asyncio
from services.classification_service import ClassificationService
from services.image_service import ImageService

class TestClassificationService(unittest.TestCase):
    def setUp(self):
        self.classification_service = ClassificationService()

    @patch('services.classification_service.AsyncOpenAI')
    async def test_classify_images(self, mock_openai):
        # OpenAI API 응답 모킹
        mock_response = MagicMock()
        mock_response.choices[0].message.tool_calls[0].function.name = "classify_images"
        mock_response.choices[0].message.tool_calls[0].function.arguments = '{"classifications": [{"index": 0, "category": "cat"}, {"index": 1, "category": "dog"}]}'
        mock_openai.return_value.chat.completions.create.return_value = mock_response

        images = ["http://example.com/cat.jpg", "http://example.com/dog.jpg"]
        categories = ["cat", "dog", "bird"]

        result = await self.classification_service.classify_images(images, categories)

        self.assertEqual(result, ["cat", "dog"])

    @patch('services.classification_service.AsyncOpenAI')
    async def test_classify_images_with_none(self, mock_openai):
        mock_response = MagicMock()
        mock_response.choices[0].message.tool_calls[0].function.name = "classify_images"
        mock_response.choices[0].message.tool_calls[0].function.arguments = '{"classifications": [{"index": 0, "category": "cat"}, {"index": 1, "category": "unknown"}]}'
        mock_openai.return_value.chat.completions.create.return_value = mock_response

        images = ["http://example.com/cat.jpg", "http://example.com/unknown.jpg"]
        categories = ["cat", "dog"]

        result = await self.classification_service.classify_images(images, categories)

        self.assertEqual(result, ["cat", "NONE"])

    @patch('services.classification_service.AsyncOpenAI')
    async def test_classify_images_api_error(self, mock_openai):
        mock_openai.return_value.chat.completions.create.side_effect = Exception("API Error")

        images = ["http://example.com/error.jpg"]
        categories = ["cat", "dog"]

        with self.assertRaises(Exception):
            await self.classification_service.classify_images(images, categories)

    def test_parse_classification_response(self):
        mock_response = MagicMock()
        mock_response.choices[0].message.tool_calls[0].function.name = "classify_images"
        mock_response.choices[0].message.tool_calls[0].function.arguments = '{"classifications": [{"index": 0, "category": "cat"}, {"index": 1, "category": "dog"}]}'

        categories = ["cat", "dog", "bird"]
        image_count = 2

        result = self.classification_service._parse_classification_response(mock_response, categories, image_count)

        self.assertEqual(result, ["cat", "dog"])

class TestImageService(unittest.TestCase):
    @patch('services.image_service.requests.get')
    def test_encode_image(self, mock_get):
        mock_get.return_value.content = b'fake image content'
        
        url = "http://example.com/image.jpg"
        result = ImageService.encode_image(url)
        
        self.assertTrue(isinstance(result, str))
        self.assertTrue(result.startswith('ZmFrZSBpbWFnZSBjb250ZW50'))  # Base64로 인코딩된 '가짜 이미지 콘텐츠'

    @patch('services.image_service.requests.head')
    def test_is_url_image(self, mock_head):
        mock_head.return_value.headers = {"content-type": "image/jpeg"}
        self.assertTrue(ImageService.is_url_image("http://example.com/valid.jpg"))

        mock_head.return_value.headers = {"content-type": "text/html"}
        self.assertFalse(ImageService.is_url_image("http://example.com/invalid.html"))

    @patch('services.image_service.requests.get')
    @patch('services.image_service.Image.open')
    def test_resize_image(self, mock_image_open, mock_get):
        mock_image = MagicMock()
        mock_image.save.side_effect = lambda f, format: f.write(b'resized image content')
        mock_image_open.return_value = mock_image

        mock_response = MagicMock()
        mock_response.content = b'original image content'
        mock_get.return_value = mock_response

        url = "http://example.com/image.jpg"
        result = ImageService.resize_image(url)

        self.assertTrue(isinstance(result, str))
        self.assertEqual(result, "cmVzaXplZCBpbWFnZSBjb250ZW50")  # Base64로 인코딩된 '리사이즈된 이미지 콘텐츠'

    def test_prepare_images_for_ai(self):
        images = ["http://example.com/image1.jpg", "http://example.com/image2.jpg"]
        result = ImageService.prepare_images_for_ai(images)

        expected_result = [
            {"type": "text", "text": "Image 0:"},
            {"type": "image_url", "image_url": {"url": "http://example.com/image1.jpg"}},
            {"type": "text", "text": "Image 1:"},
            {"type": "image_url", "image_url": {"url": "http://example.com/image2.jpg"}}
        ]

        self.assertEqual(result, expected_result)

if __name__ == '__main__':
    unittest.main()
