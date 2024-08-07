from flask import jsonify
from werkzeug.exceptions import HTTPException
from exceptions.custom_exceptions import (
    InvalidAPIKeyError, ImageProcessingError, ClassificationError,
    TrainingError, DatabaseError, BaseCustomException
)
from utils.logger import get_logger

logger = get_logger(__name__)

def register_error_handlers(app):
    """
    Flask 애플리케이션에 오류 핸들러를 등록합니다.

    이 함수는 특정 예외와 일반 HTTP 예외에 대한
    사용자 정의 오류 핸들러를 설정합니다.

    Args:
        app (Flask): Flask 애플리케이션 인스턴스.
    """

    @app.errorhandler(InvalidAPIKeyError)
    def handle_invalid_api_key(error):
        """InvalidAPIKeyError 처리."""
        logger.warning(f"유효하지 않은 API 키 사용 시도: {error}")
        return jsonify({'error': str(error)}), 403

    @app.errorhandler(ImageProcessingError)
    def handle_image_processing_error(error):
        """ImageProcessingError 처리."""
        logger.error(f"이미지 처리 오류 발생: {error}")
        return jsonify({'error': str(error)}), 400

    @app.errorhandler(ClassificationError)
    def handle_classification_error(error):
        """ClassificationError 처리."""
        logger.error(f"분류 오류 발생: {error}")
        return jsonify({'error': str(error)}), 500

    @app.errorhandler(TrainingError)
    def handle_training_error(error):
        """TrainingError 처리."""
        logger.error(f"훈련 오류 발생: {error}")
        return jsonify({'error': str(error)}), 500

    @app.errorhandler(DatabaseError)
    def handle_database_error(error):
        """DatabaseError 처리."""
        logger.error(f"데이터베이스 오류 발생: {error}")
        return jsonify({'error': str(error)}), 500

    @app.errorhandler(BaseCustomException)
    def handle_base_custom_exception(error):
        """BaseCustomException 처리."""
        logger.error(f"사용자 정의 예외 발생: {error}")
        return jsonify({'error': str(error)}), 500

    @app.errorhandler(HTTPException)
    def handle_http_exception(error):
        """일반 HTTP 예외 처리."""
        logger.warning(f"HTTP 예외 발생: {error}")
        return jsonify({'error': str(error)}), error.code

    @app.errorhandler(Exception)
    def handle_generic_exception(error):
        """처리되지 않은 모든 예외 처리."""
        logger.exception(f"예기치 않은 오류 발생: {error}")
        return jsonify({'error': '예기치 않은 오류가 발생했습니다'}), 500
