import base64
import requests
from PIL import Image
import io
import os
from config import config


class ImageService:
    """
    이미지 관련 작업을 처리하는 서비스 클래스.

    이 클래스는 이미지 인코딩, 크기 조정, 저장 및 AI 처리를 위한 이미지 준비 등
    다양한 이미지 관련 기능을 제공합니다.
    """

    @staticmethod
    def encode_image(image_url):
        """
        URL에서 이미지를 가져와 base64로 인코딩합니다.

        Args:
            image_url (str): 인코딩할 이미지의 URL.

        Returns:
            str: Base64로 인코딩된 이미지 문자열.

        Raises:
            requests.RequestException: 이미지 다운로드 중 오류 발생 시.
        """
        response = requests.get(image_url)
        response.raise_for_status()  # 요청이 실패하면 예외를 발생시킵니다.
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

        Note:
            이 메서드는 HEAD 요청을 사용하여 콘텐츠 타입을 확인합니다.
        """
        image_formats = ("image/png", "image/jpeg", "image/jpg")
        try:
            r = requests.head(image_url)
            return r.headers.get("content-type", "") in image_formats
        except requests.RequestException:
            return False

    @staticmethod
    def resize_image(image_url, max_size=(224, 224)):
        """
        URL에서 이미지를 가져와 크기를 조정하고 base64로 인코딩된 문자열로 반환합니다.

        Args:
            image_url (str): 크기를 조정할 이미지의 URL.
            max_size (tuple): 조정된 이미지의 최대 너비와 높이. 기본값은 (224, 224).

        Returns:
            str: 크기가 조정되고 Base64로 인코딩된 이미지 문자열.

        Raises:
            requests.RequestException: 이미지 다운로드 중 오류 발생 시.
            PIL.UnidentifiedImageError: 이미지 형식을 인식할 수 없는 경우.
        """
        response = requests.get(image_url)
        response.raise_for_status()
        img = Image.open(io.BytesIO(response.content))
        img.thumbnail(max_size)
        buffered = io.BytesIO()
        img.save(buffered, format="JPEG")
        return base64.b64encode(buffered.getvalue()).decode("utf-8")

    @staticmethod
    def save_image(image_url, label, workspace_id, file_name):
        """
        URL에서 이미지를 가져와 지정된 경로에 저장합니다.

        Args:
            image_url (str): 저장할 이미지의 URL.
            label (str): 이미지의 레이블 (디렉토리 이름으로 사용됨).
            workspace_id (int): 작업 공간 ID.
            file_name (str): 저장할 파일 이름.

        Returns:
            str: 저장된 이미지의 경로.

        Raises:
            requests.RequestException: 이미지 다운로드 중 오류 발생 시.
            IOError: 이미지 저장 중 오류 발생 시.
        """
        dir_path = os.path.join(config.BASE_DIR, "workspace", str(workspace_id), label)
        os.makedirs(dir_path, exist_ok=True)

        image_path = os.path.join(dir_path, f"{file_name}.jpg")
        response = requests.get(image_url)
        response.raise_for_status()
        with open(image_path, "wb") as img_file:
            img_file.write(response.content)

        return image_path

    @staticmethod
    def prepare_images_for_ai(images):
        """
        AI 처리를 위해 이미지를 준비합니다.

        이 메서드는 이미지 URL 목록을 받아 AI 모델이 처리할 수 있는 형식으로 변환합니다.
        로컬 호스트 이미지의 경우 크기를 조정하고 base64로 인코딩합니다.

        Args:
            images (list of str): 이미지 URL 목록.

        Returns:
            list: AI 처리를 위해 준비된 이미지 목록. 각 이미지는 텍스트와 URL 또는 base64 인코딩된 데이터로 구성됩니다.

        Note:
            반환된 리스트의 각 요소는 이미지 인덱스를 나타내는 텍스트와 이미지 URL 또는 base64 인코딩된 데이터를 포함합니다.
        """
        images_for_ai = []
        for index, url in enumerate(images):
            images_for_ai.append(
                {
                    "type": "text",
                    "text": f"Image {index}:",
                }
            )
            images_for_ai.append(
                {
                    "type": "image_url",
                    "image_url": {
                        "url": url
                        if "localhost" not in url
                        else f"data:image/jpeg;base64,{ImageService.resize_image(url)}"
                    },
                }
            )
        return images_for_ai
