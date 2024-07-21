import logging
from openai import AsyncOpenAI
from services.image_service import ImageService
from utils.function_schemas import get_image_classification_tool


class ClassificationService:
    """OpenAI API를 사용하여 이미지를 분류하는 서비스."""

    def __init__(self):
        """AsyncOpenAI 클라이언트로 ClassificationService를 초기화합니다."""
        self.client = AsyncOpenAI()

    async def classify_images(self, images, categories):
        """
        주어진 이미지를 제공된 카테고리로 분류합니다 (OpenAI API 사용).

        Args:
            images (list): 분류할 이미지 URL 목록.
            categories (list): 분류 가능한 카테고리 목록.

        Returns:
            list: 각 이미지에 대한 분류 결과 목록.

        Raises:
            Exception: API 호출 또는 응답 파싱 중 오류 발생 시.
        """
        tool = get_image_classification_tool(categories)
        images_for_ai = self._prepare_images_for_ai(images)

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
            return self._parse_tool_response(response, categories, len(images))
        except Exception as e:
            logging.error(f"Error in API call: {e}")
            raise

    def _prepare_images_for_ai(self, images):
        """
        API 요구사항에 맞게 이미지를 AI 처리용으로 포맷팅합니다.

        Args:
            images (list): 이미지 URL 목록.

        Returns:
            list: AI 처리를 위해 준비된 포맷된 이미지 목록.
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

    def _parse_tool_response(self, response, categories, image_count):
        """
        OpenAI API의 도구 응답을 파싱합니다.

        Args:
            response: OpenAI API의 응답 객체.
            categories (list): 유효한 카테고리 목록.
            image_count (int): 처리된 이미지 수.

        Returns:
            list: 각 이미지에 대한 파싱된 분류 결과.
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
                logging.warning(f"Unexpected tool call or no tool call found")
                return ["NONE"] * image_count
        except Exception as e:
            logging.error(f"Error parsing tool call response: {e}")
            return ["NONE"] * image_count
