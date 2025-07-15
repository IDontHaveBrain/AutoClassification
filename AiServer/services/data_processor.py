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
        chunk_size (int): 각 청크당 처리할 이미지 수 (기본값: 8).
        max_concurrent_chunks (int): 동시에 처리할 수 있는 청크 수 (기본값: 5).
    """
    
    # Configuration constants for chunking strategy
    DEFAULT_CHUNK_SIZE = 8  # Optimal size for LLM API payload limits
    MAX_CHUNK_SIZE = 10     # Maximum recommended chunk size
    DEFAULT_CONCURRENCY = 10  # Default concurrent chunk processing limit

    def __init__(self, chunk_size=None, max_concurrent_chunks=None):
        """
        DataProcessor 인스턴스를 초기화합니다.

        ClassificationService와 YOLOService 인스턴스를 생성하여 이미지 분류 및 YOLO 모델 기능을 준비합니다.
        
        Args:
            chunk_size (int, optional): 각 청크당 처리할 이미지 수. 기본값은 config 또는 DEFAULT_CHUNK_SIZE.
            max_concurrent_chunks (int, optional): 동시 처리할 청크 수. 기본값은 config 또는 DEFAULT_CONCURRENCY.
        """
        self.classification_service = ClassificationService()
        self.yolo_service = YOLOService()
        # Use config values first, then fallback to parameters, then class defaults
        self.chunk_size = chunk_size or getattr(config, 'DATA_PROCESSOR_CHUNK_SIZE', self.DEFAULT_CHUNK_SIZE)
        self.max_concurrent_chunks = max_concurrent_chunks or getattr(config, 'DATA_PROCESSOR_MAX_CONCURRENT_CHUNKS', self.DEFAULT_CONCURRENCY)
        
        # Validate chunk size
        if self.chunk_size > self.MAX_CHUNK_SIZE:
            logging.warning(f"Chunk size {self.chunk_size} exceeds recommended maximum {self.MAX_CHUNK_SIZE}. "
                          f"This may cause LLM API payload limit issues.")
        
        logging.info(f"DataProcessor initialized with chunk_size={self.chunk_size}, "
                    f"max_concurrent_chunks={self.max_concurrent_chunks}")

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
        
        # Handle case where no valid images are found
        if not filtered_dto_image_pairs:
            logging.warning("No valid images found after filtering")
            return []
        
        # Use adaptive chunk size to avoid LLM API payload limits
        # Optimal size for image processing while maintaining efficiency
        adaptive_chunk_size = self._get_adaptive_chunk_size(len(filtered_dto_image_pairs))
        chunks = list(self._chunk_list(filtered_dto_image_pairs, adaptive_chunk_size))
        
        logging.info(f"Processing {len(filtered_dto_image_pairs)} images in {len(chunks)} chunks "
                    f"(adaptive_chunk_size={adaptive_chunk_size})")

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
        # Reduce concurrency to handle more but smaller chunks efficiently
        # This prevents overwhelming the API with too many simultaneous requests
        semaphore = asyncio.Semaphore(self.max_concurrent_chunks)

        async def process_chunk(chunk):
            async with semaphore:
                try:
                    images = [url for _, url in chunk]
                    chunk_start_time = asyncio.get_event_loop().time()
                    chunk_labels = await self.classification_service.classify_images(images, test_class)
                    chunk_end_time = asyncio.get_event_loop().time()
                    
                    logging.info(f"Successfully processed chunk of {len(images)} images in "
                               f"{chunk_end_time - chunk_start_time:.2f} seconds")

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
                    logging.error(f"Error processing chunk of {len(chunk)} images: {e}")
                    # Log chunk details for debugging
                    image_urls = [url for _, url in chunk]
                    logging.error(f"Failed chunk contained images: {image_urls[:3]}{'...' if len(image_urls) > 3 else ''}")
                    for dto, _ in chunk:
                        if "id" in dto:
                            labels_to_ids.setdefault("NONE", []).append(dto["id"])

        # Process chunks with timing
        start_time = asyncio.get_event_loop().time()
        tasks = [process_chunk(chunk) for chunk in chunks]
        await asyncio.gather(*tasks)
        end_time = asyncio.get_event_loop().time()
        
        # Log final processing statistics
        total_processed = sum(len(labels_to_ids.get(label, [])) for label in labels_to_ids)
        if len(chunks) > 0:
            avg_time = (end_time - start_time) / len(chunks)
            logging.info(f"Completed processing {total_processed} images across {len(chunks)} chunks "
                        f"in {end_time - start_time:.2f} seconds (avg: {avg_time:.2f}s per chunk)")
        else:
            logging.info(f"No chunks to process (0 valid images)")

        return labels_to_ids

    def _get_adaptive_chunk_size(self, total_images):
        """
        전체 이미지 수에 따라 청크 크기를 동적으로 조정합니다.
        
        소수 이미지의 경우 더 작은 청크를 사용하여 오버헤드를 줄입니다.
        대량 이미지의 경우 최대 청크 크기를 사용합니다.
        
        Args:
            total_images (int): 처리할 전체 이미지 수
            
        Returns:
            int: 조정된 청크 크기
        """
        # Handle edge case where there are no images
        if total_images == 0:
            return 1  # Return minimum chunk size to avoid division by zero
            
        if total_images <= 5:
            # 소수 이미지의 경우 오버헤드를 줄이기 위해 더 작은 청크 사용
            return max(1, min(total_images, 3))  # Ensure minimum chunk size of 1
        elif total_images <= 15:
            # 중간 크기의 배치에 대해 기본 청크 크기 사용
            return min(self.chunk_size, total_images)
        else:
            # 대량 배치에 대해 최대 효율성을 위해 더 큰 청크 사용
            return min(self.MAX_CHUNK_SIZE, self.chunk_size)
    
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
    
    def get_processing_config_recommendation(self, total_images):
        """
        주어진 이미지 수에 대한 최적 처리 구성을 추천합니다.
        
        Args:
            total_images (int): 처리할 전체 이미지 수
            
        Returns:
            dict: 추천 구성 정보
        """
        adaptive_chunk_size = self._get_adaptive_chunk_size(total_images)
        estimated_chunks = (total_images + adaptive_chunk_size - 1) // adaptive_chunk_size
        
        # 청크 수에 따라 동시성 조정
        if estimated_chunks <= 3:
            recommended_concurrency = min(estimated_chunks, 3)
        elif estimated_chunks <= 10:
            recommended_concurrency = min(self.max_concurrent_chunks, 5)
        else:
            recommended_concurrency = min(self.max_concurrent_chunks, 8)
            
        estimated_time = (estimated_chunks / recommended_concurrency) * 10  # 청크당 약 10초 추정
        
        return {
            'total_images': total_images,
            'chunk_size': adaptive_chunk_size,
            'estimated_chunks': estimated_chunks,
            'recommended_concurrency': recommended_concurrency,
            'estimated_processing_time_seconds': estimated_time,
            'memory_efficiency': 'high' if adaptive_chunk_size <= 8 else 'medium'
        }
