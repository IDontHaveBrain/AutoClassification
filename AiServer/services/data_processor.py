import asyncio
import time
import logging
from flask import jsonify
from openai import AsyncOpenAI
from config import config
from services.image_processor import ImageProcessor
from utils.function_schemas import get_image_classification_tool


class DataProcessor:
    """이미지 데이터를 처리하고 분류하는 클래스."""

    @staticmethod
    def process_data(request, operation):
        """
        이미지 분류를 위한 수신 요청 데이터를 처리합니다.

        Args:
            request: 수신 요청 객체.
            operation (str): 수행할 작업 유형 ('test' 또는 'classify').

        Returns:
            list: 레이블과 해당하는 이미지 ID를 포함하는 딕셔너리 목록.
        """
        api_key = request.headers.get("x-api-key")
        if not api_key or api_key != config.API_KEY:
            return jsonify({"message": "Invalid API key"}), 403

        data = request.json
        workspace_id = data.get("workspaceId")
        test_class = data.get("testClass", [])
        test_dtos = data.get("testImages", [])
        test_images = [dto["url"] for dto in test_dtos]

        filtered_dto_image_pairs = [
            (dto, url)
            for dto, url in zip(test_dtos, test_images)
            if ImageProcessor.is_url_image(url)
        ]
        chunks = DataProcessor.chunk_list(filtered_dto_image_pairs, 100)

        labels_to_ids = asyncio.run(
            DataProcessor.process_chunks(chunks, test_class, operation, workspace_id)
        )

        labels_and_ids = [
            {"label": label, "ids": ids} for label, ids in labels_to_ids.items()
        ]

        return labels_and_ids

    @staticmethod
    def chunk_list(lst, n):
        """
        리스트를 크기 n의 청크로 분할합니다.

        Args:
            lst (list): 분할할 리스트.
            n (int): 각 청크의 크기.

        Yields:
            list: 원본 리스트의 청크.
        """
        for i in range(0, len(lst), n):
            yield lst[i : i + n]

    @staticmethod
    async def process_chunks(chunks, test_class, operation, workspace_id=0):
        """
        이미지 청크를 비동기적으로 처리합니다.

        Args:
            chunks (list): 처리할 이미지 청크 목록.
            test_class (list): 가능한 분류 카테고리 목록.
            operation (str): 작업 유형 ('test' 또는 'classify').
            workspace_id (int): 작업 공간의 ID.

        Returns:
            dict: 레이블을 이미지 ID 목록에 매핑한 딕셔너리.
        """
        client = AsyncOpenAI()
        labels_to_ids = {}
        semaphore = asyncio.Semaphore(10)  # Increased concurrent API calls

        async def process_chunk(chunk):
            async with semaphore:
                try:
                    images_for_ai = await asyncio.to_thread(
                        DataProcessor.prepare_images_for_ai, chunk
                    )

                    start_time = time.time()
                    logging.info(
                        f"Processing chunk of {len(chunk)} images... start_time: {start_time}"
                    )

                    response = await DataProcessor.classify_images_with_tools(
                        client, images_for_ai, test_class
                    )

                    end_time = time.time()
                    logging.info(
                        f"Chunk processing duration: {end_time - start_time} seconds"
                    )

                    chunk_labels = DataProcessor.parse_tool_response(
                        response, test_class, len(chunk)
                    )

                    if operation != "test":
                        await asyncio.to_thread(
                            ImageProcessor.set_labels, chunk_labels, chunk, workspace_id
                        )

                    for label, dto_url_tuple in zip(chunk_labels, chunk):
                        dto, _ = dto_url_tuple
                        if "id" in dto:
                            labels_to_ids.setdefault(label, []).append(dto["id"])
                        else:
                            logging.warning(f"'id' is not found in dto: {dto}")

                except Exception as e:
                    logging.error(f"Error processing chunk: {e}")
                    for _, url in chunk:
                        logging.error(f"Image URL: {url}")
                    # 에러 발생 시 해당 청크의 모든 이미지를 'NONE'으로 처리
                    for dto, _ in chunk:
                        if "id" in dto:
                            labels_to_ids.setdefault("NONE", []).append(dto["id"])

        chunks_list = list(chunks)
        tasks = [process_chunk(chunk) for chunk in chunks_list]
        await asyncio.gather(*tasks)

        return labels_to_ids

    @staticmethod
    async def classify_images_with_tools(client, images_for_ai, test_class):
        """
        OpenAI API를 사용하여 함수 호출로 이미지를 분류합니다.

        Args:
            client: OpenAI 클라이언트.
            images_for_ai (list): AI 처리를 위해 준비된 이미지 목록.
            test_class (list): 가능한 분류 카테고리 목록.

        Returns:
            OpenAI API의 응답.

        Raises:
            Exception: API 호출 중 오류 발생 시.
        """
        tool = get_image_classification_tool(test_class)

        try:
            response = await client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": "Classify the following images based on the provided categories. Each image is preceded by its index number.",
                            },
                            *images_for_ai,
                        ],
                    }
                ],
                tools=[tool],
                tool_choice={"type": "function", "function": {"name": "classify_images"}},
            )
            return response
        except Exception as e:
            logging.error(f"Error in API call: {e}")
            raise

    @staticmethod
    def parse_tool_response(response, test_class, chunk_size):
        """
        OpenAI API의 도구 응답을 파싱합니다.

        Args:
            response: OpenAI API의 응답 객체.
            test_class (list): 유효한 카테고리 목록.
            chunk_size (int): 청크 내 이미지 수.

        Returns:
            list: 청크 내 각 이미지에 대한 파싱된 분류 결과.
        """
        try:
            tool_calls = response.choices[0].message.tool_calls
            if tool_calls and tool_calls[0].function.name == "classify_images":
                classifications = eval(tool_calls[0].function.arguments)
                result = ["NONE"] * chunk_size
                for classification in classifications["classifications"]:
                    index = classification["index"]
                    category = classification["category"]
                    if 0 <= index < chunk_size:
                        result[index] = category if category in test_class else "NONE"
                return result
            else:
                logging.warning(f"Unexpected tool call or no tool call found")
                return ["NONE"] * chunk_size
        except Exception as e:
            logging.error(f"Error parsing tool call response: {e}")
            return ["NONE"] * chunk_size

    @staticmethod
    def prepare_images_for_ai(chunk):
        """
        API 요구사항에 맞게 이미지를 AI 처리용으로 포맷팅합니다.

        Args:
            chunk (list): 이미지를 나타내는 (dto, url) 튜플의 목록.

        Returns:
            list: AI 처리를 위해 준비된 포맷된 이미지 목록.
        """
        images_for_ai = []
        for index, (_, url) in enumerate(chunk):
            if "localhost" in url:
                img = ImageProcessor.encode_image(url)
                images_for_ai.append(
                    {
                        "type": "text",
                        "text": f"Image {index}:",
                    }
                )
                images_for_ai.append(
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{img}"},
                    }
                )
            else:
                images_for_ai.append(
                    {
                        "type": "text",
                        "text": f"Image {index}:",
                    }
                )
                images_for_ai.append(
                    {
                        "type": "image_url",
                        "image_url": {"url": url},
                    }
                )
        return images_for_ai
