from typing import Any
import os

class Config:
    """Base configuration."""
    SECRET_KEY: str = 'my_precious_secret_key'
    DEBUG: bool = False
    TESTING: bool = False
    RABBITMQ_HOST: str = 'dev.nobrain.cc'
    RABBITMQ_PORT: int = 5672
    RABBITMQ_QUEUE: str = 'ClassifyQueue'
    RABBITMQ_RESPONSE_QUEUE: str = 'ClassifyResponseQueue'
    RABBITMQ_EXCHANGE: str = 'ClassifyExchange'
    BASE_DIR: str = 'C:/AutoClass'
    API_KEY: str = 'test'
    DATABASE_URI: str = 'sqlite:///dev.db'
    LOG_LEVEL: str = 'DEBUG'
    OPENAI_API_KEY: str = os.getenv('OPENAI_API_KEY', '')

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
