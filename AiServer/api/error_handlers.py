from flask import jsonify, request
from werkzeug.exceptions import HTTPException
from exceptions.custom_exceptions import (
    InvalidAPIKeyError, ImageProcessingError, ClassificationError,
    TrainingError, DatabaseError, BaseCustomException,
    AuthenticationError, AuthorizationError, ValidationError,
    ResourceNotFoundError, WorkspaceNotFoundError, ModelNotFoundError,
    RateLimitError, QueueFullError, ExternalServiceError,
    ConfigurationError, FileSystemError, InsufficientDataError,
    InferenceError, ExportError, DatasetError, MessageProcessingError,
    RabbitMQConnectionError, ModelError
)
from api.problem_details import ProblemDetailBuilder, ErrorResponseBuilder
from utils.logger import get_logger
import uuid
import time

logger = get_logger(__name__)

def register_error_handlers(app):
    """
    Flask 애플리케이션에 RFC 7807 Problem Details 표준을 사용하는 오류 핸들러를 등록합니다.

    이 함수는 특정 예외와 일반 HTTP 예외에 대한
    사용자 정의 오류 핸들러를 설정합니다.

    Args:
        app (Flask): Flask 애플리케이션 인스턴스.
    """

    @app.before_request
    def before_request():
        """요청 시작 시 요청 ID와 시작 시간을 설정합니다."""
        request.request_id = str(uuid.uuid4())
        request.start_time = time.time()

    @app.after_request
    def after_request(response):
        """요청 완료 시 로그를 기록합니다."""
        if hasattr(request, 'start_time'):
            duration = time.time() - request.start_time
            logger.info(
                "Request completed",
                extra={
                    'request_id': getattr(request, 'request_id', 'unknown'),
                    'method': request.method,
                    'path': request.path,
                    'status_code': response.status_code,
                    'duration': duration
                }
            )
        return response

    # =============================================================================
    # Authentication and Authorization Exception Handlers
    # =============================================================================

    @app.errorhandler(InvalidAPIKeyError)
    def handle_invalid_api_key(error):
        """InvalidAPIKeyError 처리."""
        logger.warning(
            "Invalid API key attempt",
            extra={
                'request_id': getattr(request, 'request_id', 'unknown'),
                'error_code': error.error_code,
                'details': error.details
            }
        )
        problem = ProblemDetailBuilder.from_exception(error, 401)
        return ErrorResponseBuilder.create_response(problem, 401)

    @app.errorhandler(AuthenticationError)
    def handle_authentication_error(error):
        """AuthenticationError 처리."""
        logger.warning(
            "Authentication failed",
            extra={
                'request_id': getattr(request, 'request_id', 'unknown'),
                'error_code': error.error_code,
                'details': error.details
            }
        )
        problem = ProblemDetailBuilder.from_exception(error, 401)
        return ErrorResponseBuilder.create_response(problem, 401)

    @app.errorhandler(AuthorizationError)
    def handle_authorization_error(error):
        """AuthorizationError 처리."""
        logger.warning(
            "Authorization failed",
            extra={
                'request_id': getattr(request, 'request_id', 'unknown'),
                'error_code': error.error_code,
                'details': error.details
            }
        )
        problem = ProblemDetailBuilder.from_exception(error, 403)
        return ErrorResponseBuilder.create_response(problem, 403)

    # =============================================================================
    # Validation Exception Handlers
    # =============================================================================

    @app.errorhandler(ValidationError)
    def handle_validation_error(error):
        """ValidationError 처리."""
        logger.warning(
            "Validation failed",
            extra={
                'request_id': getattr(request, 'request_id', 'unknown'),
                'error_code': error.error_code,
                'details': error.details
            }
        )
        problem = ProblemDetailBuilder.from_exception(error, 400)
        return ErrorResponseBuilder.create_response(problem, 400)

    @app.errorhandler(ConfigurationError)
    def handle_configuration_error(error):
        """ConfigurationError 처리."""
        logger.error(
            "Configuration error",
            extra={
                'request_id': getattr(request, 'request_id', 'unknown'),
                'error_code': error.error_code,
                'details': error.details
            }
        )
        problem = ProblemDetailBuilder.from_exception(error, 400)
        return ErrorResponseBuilder.create_response(problem, 400)

    # =============================================================================
    # Resource Exception Handlers
    # =============================================================================

    @app.errorhandler(ResourceNotFoundError)
    def handle_resource_not_found(error):
        """ResourceNotFoundError 처리."""
        logger.warning(
            "Resource not found",
            extra={
                'request_id': getattr(request, 'request_id', 'unknown'),
                'error_code': error.error_code,
                'details': error.details
            }
        )
        problem = ProblemDetailBuilder.from_exception(error, 404)
        return ErrorResponseBuilder.create_response(problem, 404)

    @app.errorhandler(WorkspaceNotFoundError)
    def handle_workspace_not_found(error):
        """WorkspaceNotFoundError 처리."""
        logger.warning(
            "Workspace not found",
            extra={
                'request_id': getattr(request, 'request_id', 'unknown'),
                'error_code': error.error_code,
                'details': error.details
            }
        )
        problem = ProblemDetailBuilder.from_exception(error, 404)
        return ErrorResponseBuilder.create_response(problem, 404)

    @app.errorhandler(ModelNotFoundError)
    def handle_model_not_found(error):
        """ModelNotFoundError 처리."""
        logger.warning(
            "Model not found",
            extra={
                'request_id': getattr(request, 'request_id', 'unknown'),
                'error_code': error.error_code,
                'details': error.details
            }
        )
        problem = ProblemDetailBuilder.from_exception(error, 404)
        return ErrorResponseBuilder.create_response(problem, 404)

    # =============================================================================
    # AI/ML Exception Handlers
    # =============================================================================

    @app.errorhandler(ModelError)
    def handle_model_error(error):
        """ModelError 처리."""
        logger.error(
            "Model error occurred",
            extra={
                'request_id': getattr(request, 'request_id', 'unknown'),
                'error_code': error.error_code,
                'details': error.details
            }
        )
        problem = ProblemDetailBuilder.from_exception(error, 500)
        return ErrorResponseBuilder.create_response(problem, 500)

    @app.errorhandler(ClassificationError)
    def handle_classification_error(error):
        """ClassificationError 처리."""
        logger.error(
            "Classification error occurred",
            extra={
                'request_id': getattr(request, 'request_id', 'unknown'),
                'error_code': error.error_code,
                'details': error.details
            }
        )
        problem = ProblemDetailBuilder.from_exception(error, 500)
        return ErrorResponseBuilder.create_response(problem, 500)

    @app.errorhandler(InferenceError)
    def handle_inference_error(error):
        """InferenceError 처리."""
        logger.error(
            "Inference error occurred",
            extra={
                'request_id': getattr(request, 'request_id', 'unknown'),
                'error_code': error.error_code,
                'details': error.details
            }
        )
        problem = ProblemDetailBuilder.from_exception(error, 500)
        return ErrorResponseBuilder.create_response(problem, 500)

    @app.errorhandler(TrainingError)
    def handle_training_error(error):
        """TrainingError 처리."""
        logger.error(
            "Training error occurred",
            extra={
                'request_id': getattr(request, 'request_id', 'unknown'),
                'error_code': error.error_code,
                'details': error.details
            }
        )
        problem = ProblemDetailBuilder.from_exception(error, 500)
        return ErrorResponseBuilder.create_response(problem, 500)

    @app.errorhandler(ExportError)
    def handle_export_error(error):
        """ExportError 처리."""
        logger.error(
            "Export error occurred",
            extra={
                'request_id': getattr(request, 'request_id', 'unknown'),
                'error_code': error.error_code,
                'details': error.details
            }
        )
        problem = ProblemDetailBuilder.from_exception(error, 500)
        return ErrorResponseBuilder.create_response(problem, 500)

    @app.errorhandler(DatasetError)
    def handle_dataset_error(error):
        """DatasetError 처리."""
        logger.error(
            "Dataset error occurred",
            extra={
                'request_id': getattr(request, 'request_id', 'unknown'),
                'error_code': error.error_code,
                'details': error.details
            }
        )
        problem = ProblemDetailBuilder.from_exception(error, 400)
        return ErrorResponseBuilder.create_response(problem, 400)

    @app.errorhandler(InsufficientDataError)
    def handle_insufficient_data_error(error):
        """InsufficientDataError 처리."""
        logger.warning(
            "Insufficient data for operation",
            extra={
                'request_id': getattr(request, 'request_id', 'unknown'),
                'error_code': error.error_code,
                'details': error.details
            }
        )
        problem = ProblemDetailBuilder.from_exception(error, 400)
        return ErrorResponseBuilder.create_response(problem, 400)

    # =============================================================================
    # File and Processing Exception Handlers
    # =============================================================================

    @app.errorhandler(ImageProcessingError)
    def handle_image_processing_error(error):
        """ImageProcessingError 처리."""
        logger.error(
            "Image processing error occurred",
            extra={
                'request_id': getattr(request, 'request_id', 'unknown'),
                'error_code': error.error_code,
                'details': error.details
            }
        )
        problem = ProblemDetailBuilder.from_exception(error, 400)
        return ErrorResponseBuilder.create_response(problem, 400)

    @app.errorhandler(FileSystemError)
    def handle_file_system_error(error):
        """FileSystemError 처리."""
        logger.error(
            "File system error occurred",
            extra={
                'request_id': getattr(request, 'request_id', 'unknown'),
                'error_code': error.error_code,
                'details': error.details
            }
        )
        problem = ProblemDetailBuilder.from_exception(error, 500)
        return ErrorResponseBuilder.create_response(problem, 500)

    # =============================================================================
    # External Service Exception Handlers
    # =============================================================================

    @app.errorhandler(ExternalServiceError)
    def handle_external_service_error(error):
        """ExternalServiceError 처리."""
        logger.error(
            "External service error occurred",
            extra={
                'request_id': getattr(request, 'request_id', 'unknown'),
                'error_code': error.error_code,
                'details': error.details
            }
        )
        problem = ProblemDetailBuilder.from_exception(error, 502)
        return ErrorResponseBuilder.create_response(problem, 502)

    @app.errorhandler(RabbitMQConnectionError)
    def handle_rabbitmq_connection_error(error):
        """RabbitMQConnectionError 처리."""
        logger.error(
            "RabbitMQ connection error occurred",
            extra={
                'request_id': getattr(request, 'request_id', 'unknown'),
                'error_code': error.error_code,
                'details': error.details
            }
        )
        problem = ProblemDetailBuilder.from_exception(error, 502)
        return ErrorResponseBuilder.create_response(problem, 502)

    @app.errorhandler(MessageProcessingError)
    def handle_message_processing_error(error):
        """MessageProcessingError 처리."""
        logger.error(
            "Message processing error occurred",
            extra={
                'request_id': getattr(request, 'request_id', 'unknown'),
                'error_code': error.error_code,
                'details': error.details
            }
        )
        problem = ProblemDetailBuilder.from_exception(error, 500)
        return ErrorResponseBuilder.create_response(problem, 500)

    @app.errorhandler(QueueFullError)
    def handle_queue_full_error(error):
        """QueueFullError 처리."""
        logger.warning(
            "Queue full error occurred",
            extra={
                'request_id': getattr(request, 'request_id', 'unknown'),
                'error_code': error.error_code,
                'details': error.details
            }
        )
        problem = ProblemDetailBuilder.from_exception(error, 503)
        return ErrorResponseBuilder.create_response(problem, 503)

    @app.errorhandler(RateLimitError)
    def handle_rate_limit_error(error):
        """RateLimitError 처리."""
        logger.warning(
            "Rate limit exceeded",
            extra={
                'request_id': getattr(request, 'request_id', 'unknown'),
                'error_code': error.error_code,
                'details': error.details
            }
        )
        problem = ProblemDetailBuilder.from_exception(error, 429)
        return ErrorResponseBuilder.create_response(problem, 429)

    @app.errorhandler(DatabaseError)
    def handle_database_error(error):
        """DatabaseError 처리."""
        logger.error(
            "Database error occurred",
            extra={
                'request_id': getattr(request, 'request_id', 'unknown'),
                'error_code': error.error_code,
                'details': error.details
            }
        )
        problem = ProblemDetailBuilder.from_exception(error, 500)
        return ErrorResponseBuilder.create_response(problem, 500)

    # =============================================================================
    # Generic Exception Handlers
    # =============================================================================

    @app.errorhandler(BaseCustomException)
    def handle_base_custom_exception(error):
        """BaseCustomException 처리."""
        status_code = ErrorResponseBuilder.get_status_code_for_exception(error)
        logger.error(
            "Custom exception occurred",
            extra={
                'request_id': getattr(request, 'request_id', 'unknown'),
                'error_code': error.error_code,
                'details': error.details,
                'exception_type': error.__class__.__name__
            }
        )
        problem = ProblemDetailBuilder.from_exception(error, status_code)
        return ErrorResponseBuilder.create_response(problem, status_code)

    @app.errorhandler(HTTPException)
    def handle_http_exception(error):
        """일반 HTTP 예외 처리."""
        logger.warning(
            "HTTP exception occurred",
            extra={
                'request_id': getattr(request, 'request_id', 'unknown'),
                'status_code': error.code,
                'error_name': error.name,
                'description': error.description
            }
        )
        problem = ProblemDetailBuilder.from_exception(error, error.code)
        return ErrorResponseBuilder.create_response(problem, error.code)

    @app.errorhandler(Exception)
    def handle_generic_exception(error):
        """처리되지 않은 모든 예외 처리."""
        logger.exception(
            "Unexpected exception occurred",
            extra={
                'request_id': getattr(request, 'request_id', 'unknown'),
                'error_type': error.__class__.__name__,
                'error_message': str(error)
            }
        )
        problem = ProblemDetailBuilder.from_exception(error, 500)
        return ErrorResponseBuilder.create_response(problem, 500)
