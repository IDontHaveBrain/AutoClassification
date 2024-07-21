import base64
import json
import os
import requests
from config import config


class ImageProcessor:
    @staticmethod
    def check_inclusion(labels, class_list):
        """
        레이블이 클래스 목록에 포함되어 있는지 확인합니다.

        Args:
            labels (list): 확인할 레이블 목록.
            class_list (list): 유효한 클래스 목록.

        Returns:
            list: 검증된 레이블 목록. 유효하지 않은 레이블은 'NONE'으로 대체됩니다.
        """
        result = []
        for word in labels:
            if word == "NONE" or word not in class_list:
                result.append("NONE")
            else:
                result.append(word)
        return result

    @staticmethod
    def set_labels(labels, dtos, workspace_id):
        """
        이미지에 레이블을 설정하고 파일 시스템에 저장합니다.

        Args:
            labels (list): 설정할 레이블 목록.
            dtos (list): 이미지 정보를 포함한 DTO 목록.
            workspace_id (int): 작업 공간 ID.

        Returns:
            dict: 설정된 레이블과 DTO 정보를 포함한 딕셔너리.
        """
        for label, (dto, _) in zip(labels, dtos):
            dir_path = os.path.join(
                config.BASE_DIR, "workspace", str(workspace_id), label
            )
            os.makedirs(dir_path, exist_ok=True)

            file_name = f"{label}.txt"
            file_path = os.path.join(dir_path, file_name)

            image_url = dto["url"]
            response = requests.get(image_url)
            image_path = os.path.join(dir_path, f"{dto['fileName']}.jpg")
            with open(image_path, "wb") as img_file:
                img_file.write(response.content)

            with open(file_path, "a") as file:
                data = {"id": dto["id"], "name": label, "url": image_url}
                file.write(json.dumps(data) + "\n")

        return {"labels": labels, "dtos": dtos}

    @staticmethod
    def get_labels_to_ids(labels, dtos):
        """
        레이블을 해당하는 이미지 ID에 매핑합니다.

        Args:
            labels (list): 레이블 목록.
            dtos (list): 이미지 정보를 포함한 DTO 목록.

        Returns:
            dict: 레이블을 이미지 ID 목록에 매핑한 딕셔너리.
        """
        labels_to_ids = {}
        for label, dto_url_tuple in zip(labels, dtos):
            dto, url = dto_url_tuple
            if "id" in dto:
                if label in labels_to_ids:
                    labels_to_ids[label].append(dto["id"])
                else:
                    labels_to_ids[label] = [dto["id"]]
            else:
                print(f"'id' is not found in dto: {dto}")
        return labels_to_ids

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
    def encode_image(url):
        """
        URL에서 이미지를 가져와 base64로 인코딩합니다.

        Args:
            url (str): 인코딩할 이미지의 URL.

        Returns:
            str: Base64로 인코딩된 이미지 문자열.
        """
        response = requests.get(url)
        image_content = response.content
        base64_image = base64.b64encode(image_content)
        return base64_image.decode("utf-8")
