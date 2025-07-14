import asyncio
import logging
from flask import jsonify
from config import config
from services.image_service import ImageService
from services.classification_service import ClassificationService
from services.yolo_service import YOLOService


class DataProcessor:
    """
    이미지 데이터를 처리하고 분류하는 클래스.

    이 클래스는 이미지 분류 요청을 처리하고, 대량의 이미지를 효율적으로 분류하기 위한
    비동기 처리 로직을 구현합니다.

    Attributes:
        classification_service (ClassificationService): 이미지 분류 서비스 인스턴스.
        yolo_service (YOLOService): YOLO 모델 훈련 및 추론 서비스 인스턴스.
    """

    def __init__(self):
        """
        DataProcessor 인스턴스를 초기화합니다.

        ClassificationService와 YOLOService 인스턴스를 생성하여 이미지 분류 및 YOLO 모델 기능을 준비합니다.
        """
        self.classification_service = ClassificationService()
        self.yolo_service = YOLOService()

    def process_data(self, request, operation):
        """
        이미지 분류를 위한 수신 요청 데이터를 처리합니다.

        이 메서드는 클라이언트로부터 받은 요청을 파싱하고, 이미지 분류 작업을 수행한 후
        결과를 반환합니다.

        Args:
            request (flask.Request): Flask 요청 객체.
            operation (str): 수행할 작업 유형 ('test' 또는 'classify').

        Returns:
            list: 레이블과 해당하는 이미지 ID를 포함하는 딕셔너리 목록.
        """
        # API key validation is handled at the route level
        data = request.json
        workspace_id = data.get("workspaceId")
        test_class = data.get("testClass", [])
        test_dtos = data.get("testImages", [])
        test_images = [dto["url"] for dto in test_dtos]

        filtered_dto_image_pairs = [
            (dto, url)
            for dto, url in zip(test_dtos, test_images)
            if ImageService.is_url_image(url)
        ]
        
        # Debug logging
        logging.info(f"Total test images: {len(test_images)}")
        logging.info(f"Filtered images after validation: {len(filtered_dto_image_pairs)}")
        for dto, url in zip(test_dtos, test_images):
            is_valid = ImageService.is_url_image(url)
            logging.info(f"Image URL: {url} - Valid: {is_valid}")
        chunks = self._chunk_list(filtered_dto_image_pairs, 100)

        labels_to_ids = asyncio.run(
            self._process_chunks(chunks, test_class, operation, workspace_id)
        )

        return [
            {"label": label, "ids": ids} for label, ids in labels_to_ids.items()
        ]

    async def _process_chunks(self, chunks, test_class, operation, workspace_id=0):
        """
        청크를 비동기적으로 처리합니다.

        이 메서드는 이미지 청크를 병렬로 처리하여 분류 작업의 효율성을 높입니다.

        Args:
            chunks (list): 처리할 이미지 청크 목록.
            test_class (list): 분류에 사용할 클래스 목록.
            operation (str): 수행할 작업 유형 ('test' 또는 'classify').
            workspace_id (int, optional): 작업 공간 ID. 기본값은 0.

        Returns:
            dict: 레이블을 키로, 해당 레이블로 분류된 이미지 ID 목록을 값으로 하는 딕셔너리.
        """
        labels_to_ids = {}
        semaphore = asyncio.Semaphore(10)

        async def process_chunk(chunk):
            async with semaphore:
                try:
                    images = [url for _, url in chunk]
                    chunk_labels = await self.classification_service.classify_images(images, test_class)

                    if operation != "test":
                        for label, (dto, url) in zip(chunk_labels, chunk):
                            ImageService.save_image(url, label, workspace_id, dto['fileName'])

                    for label, dto_url_tuple in zip(chunk_labels, chunk):
                        dto, _ = dto_url_tuple
                        if "id" in dto:
                            labels_to_ids.setdefault(label, []).append(dto["id"])
                        else:
                            logging.warning(f"'id' is not found in dto: {dto}")

                except Exception as e:
                    logging.error(f"Error processing chunk: {e}")
                    for dto, _ in chunk:
                        if "id" in dto:
                            labels_to_ids.setdefault("NONE", []).append(dto["id"])

        tasks = [process_chunk(chunk) for chunk in chunks]
        await asyncio.gather(*tasks)

        return labels_to_ids

    @staticmethod
    def _chunk_list(lst, n):
        """
        리스트를 크기 n의 청크로 분할합니다.

        Args:
            lst (list): 분할할 리스트.
            n (int): 각 청크의 크기.

        Yields:
            list: 크기 n (또는 그 이하)의 하위 리스트.
        """
        for i in range(0, len(lst), n):
            yield lst[i: i + n]
