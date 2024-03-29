import base64
import json
import os
import random
from datetime import datetime

import requests

import config


class ImageProcessor:
    @staticmethod
    def check_inclusion(labels, class_list):
        result = []
        for word in labels:
            if any(test_word in word for test_word in class_list):
                result.append(next((test_word for test_word in class_list if test_word in word), 'none'))
            else:
                result.append('none')
        return result

    @staticmethod
    def set_labels(labels, dtos, workspaceId):
        for label, (dto, _) in zip(labels, dtos):
            dir_path = os.path.join(config.BASE_DIR, 'workspace', str(workspaceId), label)
            os.makedirs(dir_path, exist_ok=True)

            file_name = f"{label}.txt"
            file_path = os.path.join(dir_path, file_name)

            image_url = dto['url']
            response = requests.get(image_url)
            random_value = random.randint(1000, 9999)
            image_path = os.path.join(dir_path, f"{label}_{datetime.now().strftime('%m%d%H%M%S%f')}_{str(random_value)}.jpg")
            with open(image_path, 'wb') as img_file:
                img_file.write(response.content)

            with open(file_path, 'a') as file:
                data = {"id": dto['id'], "name": label, "url": image_url}
                file.write(json.dumps(data) + '\n')

        return {"labels": labels, "dtos": dtos}

    @staticmethod
    def get_labels_to_ids(labels, dtos):
        labels_to_ids = {}
        for label, dto_url_tuple in zip(labels, dtos):
            dto, url = dto_url_tuple
            if 'id' in dto:
                if label in labels_to_ids:
                    labels_to_ids[label].append(dto['id'])
                else:
                    labels_to_ids[label] = [dto['id']]
            else:
                print(f"'id' is not found in dto: {dto}")
        return labels_to_ids

    @staticmethod
    def is_url_image(image_url):
        image_formats = ("image/png", "image/jpeg", "image/jpg")
        r = requests.head(image_url)
        if r.headers["content-type"] in image_formats:
            return True
        return False

    @staticmethod
    def encode_image(url):
        response = requests.get(url)
        image_content = response.content
        base64_image = base64.b64encode(image_content)
        return base64_image.decode('utf-8')