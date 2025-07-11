from typing import Any
import os
from dotenv import load_dotenv
from exceptions.custom_exceptions import InvalidAPIKeyError

load_dotenv()

class Config:
    """Base configuration."""
    SECRET_KEY: str = os.getenv('SECRET_KEY', 'my_precious_secret_key')
    DEBUG: bool = os.getenv('DEBUG', 'False').lower() in ('true', '1', 'yes')
    TESTING: bool = os.getenv('TESTING', 'False').lower() in ('true', '1', 'yes')
    RABBITMQ_HOST: str = os.getenv('RABBITMQ_HOST', 'dev.nobrain.cc')
    RABBITMQ_PORT: int = int(os.getenv('RABBITMQ_PORT', '5672'))
    RABBITMQ_QUEUE: str = os.getenv('RABBITMQ_QUEUE', 'ClassifyQueue')
    RABBITMQ_RESPONSE_QUEUE: str = os.getenv('RABBITMQ_RESPONSE_QUEUE', 'ResponseQueue')
    RABBITMQ_EXCHANGE: str = os.getenv('RABBITMQ_EXCHANGE', 'ClassifyExchange')
    RABBITMQ_TRAIN_QUEUE: str = os.getenv('RABBITMQ_TRAIN_QUEUE', 'TrainQueue')
    BASE_DIR: str = os.getenv('BASE_DIR', 'C:/AutoClass')
    API_KEY: str = os.getenv('API_KEY', 'test')
    DATABASE_URI: str = os.getenv('DATABASE_URI', 'sqlite:///dev.db')
    LOG_LEVEL: str = os.getenv('LOG_LEVEL', 'DEBUG')
    
    # API Keys in priority order
    OPENROUTER_API_KEY: str = os.getenv('OPENROUTER_API_KEY', '')
    GEMINI_API_KEY: str = os.getenv('GEMINI_API_KEY', '')
    OPENAI_API_KEY: str = os.getenv('OPENAI_API_KEY', '')
    ANTHROPIC_API_KEY: str = os.getenv('ANTHROPIC_API_KEY', '')

    def __init__(self, **kwargs: Any) -> None:
        """
        환경 변수로 Config 객체를 초기화합니다.

        Args:
            **kwargs: 환경 변수에서 로드된 설정 값들
        """
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, self._convert_value(key, value))

    def _convert_value(self, key: str, value: str) -> Any:
        """
        설정 값을 적절한 타입으로 변환합니다.

        Args:
            key (str): 설정 키
            value (str): 설정 값

        Returns:
            Any: 변환된 설정 값
        """
        attr_type = type(getattr(self, key))
        if attr_type == bool:
            return value.lower() in ('true', '1', 'yes')
        return attr_type(value)
    
    def get_llm_config(self) -> dict:
        """
        우선순위에 따라 사용할 LLM 설정을 반환합니다.
        
        Returns:
            dict: API 키, 모델명, 베이스 URL 등을 포함한 LLM 설정
        """
        configs = self.get_all_available_llm_configs()
        if not configs:
            raise InvalidAPIKeyError(
                "No valid API key found. Please set at least one of: OPENROUTER_API_KEY, GEMINI_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY",
                details={
                    'available_providers': ['OPENROUTER', 'GEMINI', 'OPENAI', 'ANTHROPIC'],
                    'config_section': 'API_KEYS'
                }
            )
        return configs[0]
    
    def get_all_available_llm_configs(self) -> list:
        """
        사용 가능한 모든 LLM 설정을 우선순위 순으로 반환합니다.
        
        Returns:
            list: 우선순위 순으로 정렬된 LLM 설정 목록
        """
        configs = []
        
        # 우선순위: OPENROUTER -> GEMINI -> OPENAI -> ANTHROPIC
        if self.OPENROUTER_API_KEY:
            configs.append({
                'api_key': self.OPENROUTER_API_KEY,
                'model': 'google/gemini-2.5-flash',
                'base_url': 'https://openrouter.ai/api/v1',
                'provider': 'openrouter'
            })
        
        if self.GEMINI_API_KEY:
            configs.append({
                'api_key': self.GEMINI_API_KEY,
                'model': 'gemini/gemini-2.5-flash',
                'base_url': None,
                'provider': 'gemini'
            })
        
        if self.OPENAI_API_KEY:
            configs.append({
                'api_key': self.OPENAI_API_KEY,
                'model': 'gpt-4.1-mini',
                'base_url': None,
                'provider': 'openai'
            })
        
        if self.ANTHROPIC_API_KEY:
            configs.append({
                'api_key': self.ANTHROPIC_API_KEY,
                'model': 'claude-3-5-haiku-latest',
                'base_url': None,
                'provider': 'anthropic'
            })
        
        return configs
