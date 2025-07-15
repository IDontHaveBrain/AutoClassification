import os
from dotenv import load_dotenv
from .config import Config

# Load environment variables from .env file
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

# Create a config object
config = get_config()
