from datetime import datetime
from typing import Dict, Any, Optional


class BaseCustomException(Exception):
    """
    사용자 정의 예외의 기본 클래스입니다.

    모든 사용자 정의 예외는 이 클래스를 상속받아야 합니다.
    """
    def __init__(self, message: str, error_code: Optional[str] = None, details: Optional[Dict[str, Any]] = None):
        self.message = message
        self.error_code = error_code
        self.details = details or {}
        self.timestamp = datetime.utcnow()
        super().__init__(self.message)
    
    def to_dict(self) -> Dict[str, Any]:
        """예외 정보를 딕셔너리로 변환합니다."""
        result = {
            'message': self.message,
            'error_code': self.error_code,
            'timestamp': self.timestamp.isoformat(),
            'exception_type': self.__class__.__name__
        }
        if self.details:
            result['details'] = self.details
        return result

# =============================================================================
# Authentication and Authorization Exceptions
# =============================================================================

class InvalidAPIKeyError(BaseCustomException):
    """
    유효하지 않은 API 키가 제공되었을 때 발생하는 예외입니다.

    이 예외는 인증을 위해 제공된 API 키가 유효하지 않거나
    인식되지 않음을 나타내는 데 사용됩니다.
    """
    def __init__(self, message: str = "유효하지 않은 API 키", provider: Optional[str] = None, **kwargs):
        super().__init__(message, error_code="INVALID_API_KEY", **kwargs)
        if provider:
            self.details.update({'provider': provider})


class AuthenticationError(BaseCustomException):
    """인증 실패 시 발생하는 예외입니다."""
    def __init__(self, message: str = "인증 실패", **kwargs):
        super().__init__(message, error_code="AUTHENTICATION_ERROR", **kwargs)


class AuthorizationError(BaseCustomException):
    """권한 부족 시 발생하는 예외입니다."""
    def __init__(self, message: str = "권한 부족", **kwargs):
        super().__init__(message, error_code="AUTHORIZATION_ERROR", **kwargs)


# =============================================================================
# Validation Exceptions
# =============================================================================

class ValidationError(BaseCustomException):
    """입력 데이터 검증 실패 시 발생하는 예외입니다."""
    def __init__(self, message: str = "입력 데이터 검증 실패", field: Optional[str] = None, **kwargs):
        super().__init__(message, error_code="VALIDATION_ERROR", **kwargs)
        if field:
            self.details.update({'field': field})


class ConfigurationError(BaseCustomException):
    """설정 오류 시 발생하는 예외입니다."""
    def __init__(self, message: str = "설정 오류", config_key: Optional[str] = None, **kwargs):
        super().__init__(message, error_code="CONFIGURATION_ERROR", **kwargs)
        if config_key:
            self.details.update({'config_key': config_key})

# =============================================================================
# File and Data Processing Exceptions
# =============================================================================

class ImageProcessingError(BaseCustomException):
    """
    이미지 처리 중 오류가 발생했을 때 발생하는 예외입니다.

    이 예외는 이미지 처리 중 발생하는 문제를 나타내는 데 사용됩니다.
    예를 들어, 유효하지 않은 형식이나 손상된 데이터 등의 경우에 발생합니다.
    """
    def __init__(self, message: str = "이미지 처리 중 오류 발생", file_path: Optional[str] = None, **kwargs):
        super().__init__(message, error_code="IMAGE_PROCESSING_ERROR", **kwargs)
        if file_path:
            self.details.update({'file_path': file_path})


class FileSystemError(BaseCustomException):
    """파일 시스템 작업 중 오류가 발생했을 때 발생하는 예외입니다."""
    def __init__(self, message: str = "파일 시스템 작업 중 오류 발생", file_path: Optional[str] = None, **kwargs):
        super().__init__(message, error_code="FILE_SYSTEM_ERROR", **kwargs)
        if file_path:
            self.details.update({'file_path': file_path})


class ResourceNotFoundError(BaseCustomException):
    """요청한 리소스를 찾을 수 없을 때 발생하는 예외입니다."""
    def __init__(self, message: str = "리소스를 찾을 수 없음", resource_type: Optional[str] = None, resource_id: Optional[str] = None, **kwargs):
        super().__init__(message, error_code="RESOURCE_NOT_FOUND", **kwargs)
        if resource_type:
            self.details.update({'resource_type': resource_type})
        if resource_id:
            self.details.update({'resource_id': resource_id})

# =============================================================================
# AI/ML Specific Exceptions
# =============================================================================

class ModelError(BaseCustomException):
    """AI/ML 모델 관련 오류의 기본 클래스입니다."""
    def __init__(self, message: str = "모델 관련 오류 발생", model_name: Optional[str] = None, **kwargs):
        super().__init__(message, error_code="MODEL_ERROR", **kwargs)
        if model_name:
            self.details.update({'model_name': model_name})


class ClassificationError(ModelError):
    """
    분류 과정 중 오류가 발생했을 때 발생하는 예외입니다.

    이 예외는 이미지 분류를 시도하는 동안 발생하는 문제를 나타내는 데 사용됩니다.
    예를 들어, 모델 오류나 예상치 못한 출력 등의 경우에 발생합니다.
    """
    def __init__(self, message: str = "분류 과정 중 오류 발생", model_name: Optional[str] = None, **kwargs):
        super().__init__(message, model_name=model_name, **kwargs)
        self.error_code = "CLASSIFICATION_ERROR"


class InferenceError(ModelError):
    """모델 추론 과정 중 오류가 발생했을 때 발생하는 예외입니다."""
    def __init__(self, message: str = "모델 추론 중 오류 발생", model_name: Optional[str] = None, **kwargs):
        super().__init__(message, model_name=model_name, **kwargs)
        self.error_code = "INFERENCE_ERROR"


class ModelNotFoundError(ModelError):
    """모델을 찾을 수 없을 때 발생하는 예외입니다."""
    def __init__(self, message: str = "모델을 찾을 수 없음", model_name: Optional[str] = None, version: Optional[str] = None, **kwargs):
        super().__init__(message, model_name=model_name, **kwargs)
        self.error_code = "MODEL_NOT_FOUND"
        if version:
            self.details.update({'version': version})

class TrainingError(ModelError):
    """
    모델 훈련 과정 중 오류가 발생했을 때 발생하는 예외입니다.

    이 예외는 기계 학습 모델의 훈련 중 발생하는 문제를 나타내는 데 사용됩니다.
    예를 들어, 데이터 불일치나 계산 오류 등의 경우에 발생합니다.
    """
    def __init__(self, message: str = "모델 훈련 중 오류 발생", model_name: Optional[str] = None, epoch: Optional[int] = None, **kwargs):
        super().__init__(message, model_name=model_name, **kwargs)
        self.error_code = "TRAINING_ERROR"
        if epoch:
            self.details.update({'epoch': epoch})


class ExportError(ModelError):
    """모델 내보내기 과정 중 오류가 발생했을 때 발생하는 예외입니다."""
    def __init__(self, message: str = "모델 내보내기 중 오류 발생", model_name: Optional[str] = None, export_format: Optional[str] = None, **kwargs):
        super().__init__(message, model_name=model_name, **kwargs)
        self.error_code = "EXPORT_ERROR"
        if export_format:
            self.details.update({'export_format': export_format})


class DatasetError(BaseCustomException):
    """데이터셋 관련 오류가 발생했을 때 발생하는 예외입니다."""
    def __init__(self, message: str = "데이터셋 관련 오류 발생", dataset_path: Optional[str] = None, **kwargs):
        super().__init__(message, error_code="DATASET_ERROR", **kwargs)
        if dataset_path:
            self.details.update({'dataset_path': dataset_path})


class InsufficientDataError(DatasetError):
    """데이터가 부족할 때 발생하는 예외입니다."""
    def __init__(self, message: str = "데이터가 부족함", required_count: Optional[int] = None, actual_count: Optional[int] = None, **kwargs):
        super().__init__(message, **kwargs)
        self.error_code = "INSUFFICIENT_DATA"
        if required_count:
            self.details.update({'required_count': required_count})
        if actual_count:
            self.details.update({'actual_count': actual_count})

# =============================================================================
# Database and Storage Exceptions
# =============================================================================

class DatabaseError(BaseCustomException):
    """
    데이터베이스 작업 중 오류가 발생했을 때 발생하는 예외입니다.

    이 예외는 데이터베이스 연결, 쿼리 실행 등의 작업 중 발생하는
    문제를 나타내는 데 사용됩니다.
    """
    def __init__(self, message: str = "데이터베이스 작업 중 오류 발생", operation: Optional[str] = None, **kwargs):
        super().__init__(message, error_code="DATABASE_ERROR", **kwargs)
        if operation:
            self.details.update({'operation': operation})

# =============================================================================
# Messaging and External Service Exceptions
# =============================================================================

class ExternalServiceError(BaseCustomException):
    """외부 서비스 관련 오류의 기본 클래스입니다."""
    def __init__(self, message: str = "외부 서비스 오류 발생", service_name: Optional[str] = None, **kwargs):
        super().__init__(message, error_code="EXTERNAL_SERVICE_ERROR", **kwargs)
        if service_name:
            self.details.update({'service_name': service_name})


class RabbitMQConnectionError(ExternalServiceError):
    """
    RabbitMQ 연결 중 오류가 발생했을 때 발생하는 예외입니다.

    이 예외는 RabbitMQ 서버와의 연결 설정 또는 유지 중 발생하는
    문제를 나타내는 데 사용됩니다.
    """
    def __init__(self, message: str = "RabbitMQ 연결 중 오류 발생", **kwargs):
        super().__init__(message, service_name="RabbitMQ", **kwargs)
        self.error_code = "RABBITMQ_CONNECTION_ERROR"

class MessageProcessingError(BaseCustomException):
    """
    메시지 처리 중 오류가 발생했을 때 발생하는 예외입니다.

    이 예외는 RabbitMQ로부터 받은 메시지를 처리하는 과정에서 발생하는
    문제를 나타내는 데 사용됩니다.
    """
    def __init__(self, message: str = "메시지 처리 중 오류 발생", queue_name: Optional[str] = None, **kwargs):
        super().__init__(message, error_code="MESSAGE_PROCESSING_ERROR", **kwargs)
        if queue_name:
            self.details.update({'queue_name': queue_name})


class QueueFullError(ExternalServiceError):
    """큐가 가득 찰 때 발생하는 예외입니다."""
    def __init__(self, message: str = "큐가 가득 참", queue_name: Optional[str] = None, **kwargs):
        super().__init__(message, service_name="RabbitMQ", **kwargs)
        self.error_code = "QUEUE_FULL"
        if queue_name:
            self.details.update({'queue_name': queue_name})


class RateLimitError(ExternalServiceError):
    """API 요청 제한에 도달했을 때 발생하는 예외입니다."""
    def __init__(self, message: str = "API 요청 제한 초과", service_name: Optional[str] = None, retry_after: Optional[int] = None, **kwargs):
        super().__init__(message, service_name=service_name, **kwargs)
        self.error_code = "RATE_LIMIT_EXCEEDED"
        if retry_after:
            self.details.update({'retry_after': retry_after})


class WorkspaceNotFoundError(ResourceNotFoundError):
    """워크스페이스를 찾을 수 없을 때 발생하는 예외입니다."""
    def __init__(self, message: str = "워크스페이스를 찾을 수 없음", workspace_id: Optional[str] = None, **kwargs):
        super().__init__(message, resource_type="workspace", resource_id=workspace_id, **kwargs)
        self.error_code = "WORKSPACE_NOT_FOUND"


# =============================================================================
# Exception Utility Functions
# =============================================================================

def get_exception_for_error_code(error_code: str) -> type:
    """에러 코드에 따라 적절한 예외 클래스를 반환합니다."""
    exception_mapping = {
        "INVALID_API_KEY": InvalidAPIKeyError,
        "AUTHENTICATION_ERROR": AuthenticationError,
        "AUTHORIZATION_ERROR": AuthorizationError,
        "VALIDATION_ERROR": ValidationError,
        "CONFIGURATION_ERROR": ConfigurationError,
        "IMAGE_PROCESSING_ERROR": ImageProcessingError,
        "FILE_SYSTEM_ERROR": FileSystemError,
        "RESOURCE_NOT_FOUND": ResourceNotFoundError,
        "WORKSPACE_NOT_FOUND": WorkspaceNotFoundError,
        "MODEL_ERROR": ModelError,
        "MODEL_NOT_FOUND": ModelNotFoundError,
        "CLASSIFICATION_ERROR": ClassificationError,
        "INFERENCE_ERROR": InferenceError,
        "TRAINING_ERROR": TrainingError,
        "EXPORT_ERROR": ExportError,
        "DATASET_ERROR": DatasetError,
        "INSUFFICIENT_DATA": InsufficientDataError,
        "DATABASE_ERROR": DatabaseError,
        "EXTERNAL_SERVICE_ERROR": ExternalServiceError,
        "RABBITMQ_CONNECTION_ERROR": RabbitMQConnectionError,
        "MESSAGE_PROCESSING_ERROR": MessageProcessingError,
        "QUEUE_FULL": QueueFullError,
        "RATE_LIMIT_EXCEEDED": RateLimitError,
    }
    return exception_mapping.get(error_code, BaseCustomException)


def create_exception_from_dict(error_dict: Dict[str, Any]) -> BaseCustomException:
    """딕셔너리 데이터에서 예외 객체를 생성합니다."""
    error_code = error_dict.get('error_code', 'UNKNOWN_ERROR')
    message = error_dict.get('message', 'Unknown error occurred')
    details = error_dict.get('details', {})
    
    exception_class = get_exception_for_error_code(error_code)
    return exception_class(message=message, details=details)
