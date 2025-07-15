import os
from dotenv import load_dotenv
from .config import Config

# .env 파일에서 환경 변수 로드
load_dotenv()

def get_config():
    """
    환경 변수를 로드하고 Config 객체를 생성합니다.

    Returns:
        Config: 환경 변수로 초기화된 Config 객체
    """
    config_dict = {
        key: value for key, value in os.environ.items()
        if key.isupper() and hasattr(Config, key)
    }
    return Config(**config_dict)

# config 객체 생성
config = get_config()
