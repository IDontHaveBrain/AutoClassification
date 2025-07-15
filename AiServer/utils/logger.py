import logging
import sys
from logging.handlers import RotatingFileHandler, TimedRotatingFileHandler
import os
from config import config

def setup_logging():
    """
    애플리케이션의 로깅 설정을 구성합니다.

    이 함수는 루트 로거를 stdout과 파일로 출력하는 핸들러로 구성합니다.
    로깅 레벨은 설정 파일에서 가져오며, 로그 메시지에 특정 형식을 사용합니다.
    """
    log_level = getattr(logging, config.LOG_LEVEL.upper(), logging.INFO)
    
    # 루트 로거 설정
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    # 기존 핸들러 제거
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    # 콘솔 핸들러 설정
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level)

    # 파일 핸들러 설정 (일별 로그 파일)
    log_file = os.path.join(config.BASE_DIR, 'logs', 'app.log')
    os.makedirs(os.path.dirname(log_file), exist_ok=True)
    file_handler = TimedRotatingFileHandler(log_file, when="midnight", interval=1, backupCount=30)
    file_handler.setLevel(log_level)

    # 에러 로그 파일 핸들러 설정
    error_log_file = os.path.join(config.BASE_DIR, 'logs', 'error.log')
    error_file_handler = RotatingFileHandler(error_log_file, maxBytes=10485760, backupCount=5)
    error_file_handler.setLevel(logging.ERROR)

    # 포매터 설정
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    console_handler.setFormatter(formatter)
    file_handler.setFormatter(formatter)
    error_file_handler.setFormatter(formatter)

    # 핸들러 추가
    root_logger.addHandler(console_handler)
    root_logger.addHandler(file_handler)
    root_logger.addHandler(error_file_handler)

    # 로깅 설정 확인
    root_logger.info("로깅 설정이 완료되었습니다. 로그 레벨: %s", logging.getLevelName(log_level))

def get_logger(name):
    """
    지정된 이름의 로거를 가져옵니다.

    Args:
        name (str): 로거의 이름.

    Returns:
        logging.Logger: 지정된 이름의 로거 인스턴스.
    """
    return logging.getLogger(name)
