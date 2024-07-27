import asyncio
import logging
from openai import AsyncOpenAI
from config import config
from services.image_service import ImageService
from utils.function_schemas import get_image_classification_tool


class ClassificationService:
    """
    이미지 분류를 처리하는 서비스 클래스.

    이 클래스는 OpenAI API를 사용하여 이미지 분류 작업을 수행합니다.
    AsyncOpenAI 클라이언트를 사용하여 비동기 작업을 지원합니다.

    Attributes:
        client (AsyncOpenAI): OpenAI API와 비동기적으로 통신하기 위한 클라이언트 객체.
    """

    def __init__(self):
        """
        ClassificationService 인스턴스를 초기화합니다.

        AsyncOpenAI 클라이언트를 생성하여 OpenAI API와의 통신을 준비합니다.
        """
        self.client = AsyncOpenAI()

    async def classify_images(self, images, categories):
        """
        주어진 이미지들을 지정된 카테고리로 분류합니다.

        이 메서드는 OpenAI API를 사용하여 이미지를 분류합니다. 각 이미지는 제공된 카테고리 중 하나로
        분류되며, 적절한 카테고리가 없는 경우 'NONE'으로 분류됩니다.

        Args:
            images (list of str): 분류할 이미지 URL 목록.
            categories (list of str): 가능한 분류 카테고리 목록.

        Returns:
            list of str: 각 이미지에 대한 분류 결과 목록. 각 결과는 카테고리 문자열입니다.

        Raises:
            Exception: API 호출 중 오류가 발생한 경우.

        Note:
            이 메서드는 비동기적으로 실행되며, 'await' 키워드와 함께 사용해야 합니다.
        """
        images_for_ai = ImageService.prepare_images_for_ai(images)
        tool = get_image_classification_tool(categories)

        try:
            response = await self.client.chat.completions.create(
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
            return self._parse_classification_response(response, categories, len(images))
        except Exception as e:
            logging.error(f"Error in API call: {e}")
            raise

    def _parse_classification_response(self, response, categories, image_count):
        """
        OpenAI API의 분류 응답을 파싱합니다.

        이 메서드는 API 응답을 분석하여 각 이미지에 대한 분류 결과를 추출합니다.

        Args:
            response (openai.types.chat.ChatCompletion): OpenAI API의 응답 객체.
            categories (list of str): 유효한 분류 카테고리 목록.
            image_count (int): 분류된 이미지의 총 개수.

        Returns:
            list of str: 각 이미지에 대한 분류 결과 목록. 유효하지 않은 분류나 오류의 경우 'NONE'이 반환됩니다.

        Note:
            이 메서드는 내부적으로 사용되며, 직접 호출하지 않는 것이 좋습니다.
        """
        try:
            tool_calls = response.choices[0].message.tool_calls
            if tool_calls and tool_calls[0].function.name == "classify_images":
                classifications = eval(tool_calls[0].function.arguments)
                result = ["NONE"] * image_count
                for classification in classifications["classifications"]:
                    index = classification["index"]
                    category = classification["category"]
                    if 0 <= index < image_count:
                        result[index] = category if category in categories else "NONE"
                return result
            else:
                logging.warning("Unexpected tool call or no tool call found")
                return ["NONE"] * image_count
        except Exception as e:
            logging.error(f"Error parsing classification response: {e}")
            return ["NONE"] * image_count
