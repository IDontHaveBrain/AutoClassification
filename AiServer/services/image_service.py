import base64
import requests
from PIL import Image
import io


class ImageService:
    """이미지 관련 작업을 처리하는 서비스."""

    @staticmethod
    def encode_image(image_url):
        """
        URL에서 이미지를 가져와 base64로 인코딩합니다.

        Args:
            image_url (str): 인코딩할 이미지의 URL.

        Returns:
            str: Base64로 인코딩된 이미지 문자열.
        """
        response = requests.get(image_url)
        image_content = response.content
        base64_image = base64.b64encode(image_content)
        return base64_image.decode("utf-8")

    @staticmethod
    def is_url_image(image_url):
        """
        URL이 유효한 이미지를 가리키는지 확인합니다.

        Args:
            image_url (str): 확인할 이미지 URL.

        Returns:
            bool: URL이 유효한 이미지를 가리키면 True, 그렇지 않으면 False.
        """
        image_formats = ("image/png", "image/jpeg", "image/jpg")
        r = requests.head(image_url)
        if r.headers["content-type"] in image_formats:
            return True
        return False

    @staticmethod
    def resize_image(image_url, max_size=(224, 224)):
        """
        URL에서 이미지를 가져와 크기를 조정하고 base64로 인코딩된 문자열로 반환합니다.

        Args:
            image_url (str): 크기를 조정할 이미지의 URL.
            max_size (tuple): 조정된 이미지의 최대 너비와 높이.

        Returns:
            str: 크기가 조정되고 Base64로 인코딩된 이미지 문자열.
        """
        response = requests.get(image_url)
        img = Image.open(io.BytesIO(response.content))
        img.thumbnail(max_size)
        buffered = io.BytesIO()
        img.save(buffered, format="JPEG")
        return base64.b64encode(buffered.getvalue()).decode("utf-8")
