import logging
import sys


def setup_logging():
    """
    애플리케이션의 로깅 설정을 구성합니다.

    이 함수는 루트 로거를 stdout으로 출력하는 StreamHandler로 구성합니다.
    로깅 레벨을 INFO로 설정하고 로그 메시지에 특정 형식을 사용합니다.
    """
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger()
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(logging.INFO)
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)


def get_logger(name):
    """
    지정된 이름의 로거를 가져옵니다.

    Args:
        name (str): 로거의 이름.

    Returns:
        logging.Logger: 지정된 이름의 로거 인스턴스.
    """
    return logging.getLogger(name)
