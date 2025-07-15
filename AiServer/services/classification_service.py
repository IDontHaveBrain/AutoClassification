import asyncio
import logging
import os
from litellm import acompletion
from config import config
from services.image_service import ImageService
from utils.function_schemas import get_image_classification_tool
from exceptions.custom_exceptions import InvalidAPIKeyError


class ClassificationService:
    """
    이미지 분류를 처리하는 서비스 클래스.

    이 클래스는 liteLLM을 사용하여 다양한 AI 모델을 통한 이미지 분류 작업을 수행합니다.
    우선순위에 따라 OpenRouter, Gemini, OpenAI, Anthropic 중 사용 가능한 모델을 선택합니다.

    Attributes:
        config (Config): 설정 객체
        llm_config (dict): 현재 사용 중인 LLM 설정
    """

    def __init__(self):
        """
        ClassificationService 인스턴스를 초기화합니다.

        우선순위에 따라 사용 가능한 API 키를 확인하고 LLM 설정을 초기화합니다.
        """
        self.config = config
        self.available_configs = self.config.get_all_available_llm_configs()
        self.primary_config = self.config.get_llm_config() if self.available_configs else None
        
        if self.primary_config:
            logging.info(f"Primary LLM: {self.primary_config['provider']} with model {self.primary_config['model']}")
            logging.info(f"Available fallback options: {len(self.available_configs) - 1}")
        else:
            logging.error("No API keys available for LLM services")

    async def classify_images(self, images, categories):
        """
        주어진 이미지들을 지정된 카테고리로 분류합니다.

        이 메서드는 사용 가능한 API들을 우선순위에 따라 시도하여 이미지를 분류합니다.
        각 이미지는 제공된 카테고리 중 하나로 분류되며, 적절한 카테고리가 없는 경우 'NONE'으로 분류됩니다.

        Args:
            images (list of str): 분류할 이미지 URL 목록.
            categories (list of str): 가능한 분류 카테고리 목록.

        Returns:
            list of str: 각 이미지에 대한 분류 결과 목록. 각 결과는 카테고리 문자열입니다.

        Raises:
            Exception: 모든 API 호출이 실패한 경우.

        Note:
            이 메서드는 비동기적으로 실행되며, 'await' 키워드와 함께 사용해야 합니다.
        """
        if not self.available_configs:
            raise InvalidAPIKeyError(
                "No API keys available for classification",
                details={
                    'operation': 'image_classification',
                    'available_providers': ['OPENROUTER', 'GEMINI', 'OPENAI', 'ANTHROPIC']
                }
            )
        
        images_for_ai = ImageService.prepare_images_for_ai(images)
        tool = get_image_classification_tool(categories)
        
        failed_providers = []
        last_exception = None
        
        for config_idx, llm_config in enumerate(self.available_configs):
            provider = llm_config['provider']
            
            # 이미 실패한 provider는 건너뛰기
            if provider in failed_providers:
                continue
            
            try:
                if config_idx == 0:
                    logging.info(f"Attempting classification with primary API: {provider} ({llm_config['model']})")
                else:
                    logging.warning(f"Fallback to API #{config_idx + 1}: {provider} ({llm_config['model']})")
                
                response = await acompletion(
                    model=llm_config['model'],
                    api_key=llm_config['api_key'],
                    base_url=llm_config['base_url'],
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
                
                result = self._parse_classification_response(response, categories, len(images))
                
                if config_idx == 0:
                    logging.info(f"Classification successful with primary API: {provider}")
                else:
                    logging.warning(f"Classification successful with fallback API #{config_idx + 1}: {provider}")
                
                return result
                
            except Exception as e:
                last_exception = e
                failed_providers.append(provider)
                
                if config_idx == 0:
                    logging.error(f"Primary API failed ({provider}): {e}")
                else:
                    logging.error(f"Fallback API #{config_idx + 1} failed ({provider}): {e}")
                
                # 마지막 config가 아니면 다음 시도
                if config_idx < len(self.available_configs) - 1:
                    continue
        
        # 모든 API가 실패한 경우
        logging.error(f"All available APIs failed. Failed providers: {failed_providers}")
        raise Exception(f"All API calls failed. Last error: {last_exception}")

    def _parse_classification_response(self, response, categories, image_count):
        """
        AI API의 분류 응답을 파싱합니다.

        이 메서드는 API 응답을 분석하여 각 이미지에 대한 분류 결과를 추출합니다.

        Args:
            response: liteLLM API의 응답 객체.
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

    def get_api_status(self) -> dict:
        """
        현재 사용 가능한 API들의 상태를 반환합니다.
        
        Returns:
            dict: API 상태 정보 (사용 가능한 API 개수, 우선순위 등)
        """
        return {
            'available_apis': len(self.available_configs),
            'primary_api': self.primary_config['provider'] if self.primary_config else None,
            'fallback_apis': [config['provider'] for config in self.available_configs[1:]] if len(self.available_configs) > 1 else [],
            'all_providers': [config['provider'] for config in self.available_configs]
        }
