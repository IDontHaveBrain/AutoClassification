class BaseCustomException(Exception):
    """
    사용자 정의 예외의 기본 클래스입니다.

    모든 사용자 정의 예외는 이 클래스를 상속받아야 합니다.
    """
    def __init__(self, message, error_code=None):
        self.message = message
        self.error_code = error_code
        super().__init__(self.message)

class InvalidAPIKeyError(BaseCustomException):
    """
    유효하지 않은 API 키가 제공되었을 때 발생하는 예외입니다.

    이 예외는 인증을 위해 제공된 API 키가 유효하지 않거나
    인식되지 않음을 나타내는 데 사용됩니다.
    """
    def __init__(self, message="유효하지 않은 API 키", error_code="INVALID_API_KEY"):
        super().__init__(message, error_code)

class ImageProcessingError(BaseCustomException):
    """
    이미지 처리 중 오류가 발생했을 때 발생하는 예외입니다.

    이 예외는 이미지 처리 중 발생하는 문제를 나타내는 데 사용됩니다.
    예를 들어, 유효하지 않은 형식이나 손상된 데이터 등의 경우에 발생합니다.
    """
    def __init__(self, message="이미지 처리 중 오류 발생", error_code="IMAGE_PROCESSING_ERROR"):
        super().__init__(message, error_code)

class ClassificationError(BaseCustomException):
    """
    분류 과정 중 오류가 발생했을 때 발생하는 예외입니다.

    이 예외는 이미지 분류를 시도하는 동안 발생하는 문제를 나타내는 데 사용됩니다.
    예를 들어, 모델 오류나 예상치 못한 출력 등의 경우에 발생합니다.
    """
    def __init__(self, message="분류 과정 중 오류 발생", error_code="CLASSIFICATION_ERROR"):
        super().__init__(message, error_code)

class TrainingError(BaseCustomException):
    """
    모델 훈련 과정 중 오류가 발생했을 때 발생하는 예외입니다.

    이 예외는 기계 학습 모델의 훈련 중 발생하는 문제를 나타내는 데 사용됩니다.
    예를 들어, 데이터 불일치나 계산 오류 등의 경우에 발생합니다.
    """
    def __init__(self, message="모델 훈련 중 오류 발생", error_code="TRAINING_ERROR"):
        super().__init__(message, error_code)

class DatabaseError(BaseCustomException):
    """
    데이터베이스 작업 중 오류가 발생했을 때 발생하는 예외입니다.

    이 예외는 데이터베이스 연결, 쿼리 실행 등의 작업 중 발생하는
    문제를 나타내는 데 사용됩니다.
    """
    def __init__(self, message="데이터베이스 작업 중 오류 발생", error_code="DATABASE_ERROR"):
        super().__init__(message, error_code)

class RabbitMQConnectionError(BaseCustomException):
    """
    RabbitMQ 연결 중 오류가 발생했을 때 발생하는 예외입니다.

    이 예외는 RabbitMQ 서버와의 연결 설정 또는 유지 중 발생하는
    문제를 나타내는 데 사용됩니다.
    """
    def __init__(self, message="RabbitMQ 연결 중 오류 발생", error_code="RABBITMQ_CONNECTION_ERROR"):
        super().__init__(message, error_code)

class MessageProcessingError(BaseCustomException):
    """
    메시지 처리 중 오류가 발생했을 때 발생하는 예외입니다.

    이 예외는 RabbitMQ로부터 받은 메시지를 처리하는 과정에서 발생하는
    문제를 나타내는 데 사용됩니다.
    """
    def __init__(self, message="메시지 처리 중 오류 발생", error_code="MESSAGE_PROCESSING_ERROR"):
        super().__init__(message, error_code)
