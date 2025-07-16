from datetime import datetime
from typing import Dict, Any, Optional
from dataclasses import dataclass
from flask import request
import uuid


@dataclass
class ProblemDetail:
    """
    RFC 7807 Problem Details 표준을 구현한 클래스입니다.
    
    이 클래스는 HTTP API 오류 응답을 표준화된 형식으로 구성합니다.
    """
    type: str
    title: str
    status: int
    detail: Optional[str] = None
    instance: Optional[str] = None
    
    def __post_init__(self):
        """초기화 후 추가 필드를 설정합니다."""
        if self.instance is None:
            self.instance = request.path if request else None
    
    def to_dict(self) -> Dict[str, Any]:
        """RFC 7807 표준에 따른 딕셔너리 형태로 변환합니다."""
        result = {
            "type": self.type,
            "title": self.title,
            "status": self.status,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
        if self.detail:
            result["detail"] = self.detail
        if self.instance:
            result["instance"] = self.instance
            
        return result


class ProblemDetailBuilder:
    """Problem Details 응답을 생성하는 빌더 클래스입니다."""
    
    BASE_URI = "https://api.autoclassification.dev/errors"
    
    @classmethod
    def from_exception(cls, exception, status_code: int = 500) -> ProblemDetail:
        """예외 객체로부터 Problem Details를 생성합니다."""
        from exceptions.custom_exceptions import BaseCustomException
        
        if isinstance(exception, BaseCustomException):
            return cls._from_custom_exception(exception, status_code)
        else:
            return cls._from_generic_exception(exception, status_code)
    
    @classmethod
    def _from_custom_exception(cls, exception, status_code: int) -> ProblemDetail:
        """커스텀 예외로부터 Problem Details를 생성합니다."""
        problem = ProblemDetail(
            type=f"{cls.BASE_URI}/{exception.error_code}",
            title=exception.__class__.__name__,
            status=status_code,
            detail=exception.message
        )
        
        # 추가 세부정보가 있으면 포함
        if hasattr(exception, 'details') and exception.details:
            problem_dict = problem.to_dict()
            problem_dict.update(exception.details)
            return problem_dict
        
        return problem
    
    @classmethod
    def _from_generic_exception(cls, exception, status_code: int) -> ProblemDetail:
        """일반 예외로부터 Problem Details를 생성합니다."""
        return ProblemDetail(
            type=f"{cls.BASE_URI}/INTERNAL_ERROR",
            title="Internal Server Error",
            status=status_code,
            detail=str(exception) if status_code != 500 else "An unexpected error occurred"
        )
    
    @classmethod
    def create_validation_error(cls, message: str, validation_errors: list) -> Dict[str, Any]:
        """유효성 검증 오류를 위한 Problem Details를 생성합니다."""
        problem = ProblemDetail(
            type=f"{cls.BASE_URI}/VALIDATION_ERROR",
            title="Validation Error",
            status=400,
            detail=message
        )
        
        result = problem.to_dict()
        result["validation_errors"] = validation_errors
        
        return result
    
    @classmethod
    def create_rate_limit_error(cls, message: str, retry_after: int) -> Dict[str, Any]:
        """속도 제한 오류를 위한 Problem Details를 생성합니다."""
        problem = ProblemDetail(
            type=f"{cls.BASE_URI}/RATE_LIMIT_EXCEEDED",
            title="Rate Limit Exceeded",
            status=429,
            detail=message
        )
        
        result = problem.to_dict()
        result["retry_after"] = retry_after
        
        return result
    
    @classmethod
    def create_not_found_error(cls, resource_type: str, resource_id: str) -> Dict[str, Any]:
        """리소스 찾기 실패 오류를 위한 Problem Details를 생성합니다."""
        problem = ProblemDetail(
            type=f"{cls.BASE_URI}/RESOURCE_NOT_FOUND",
            title="Resource Not Found",
            status=404,
            detail=f"{resource_type} with id '{resource_id}' was not found"
        )
        
        result = problem.to_dict()
        result["resource_type"] = resource_type
        result["resource_id"] = resource_id
        
        return result


class ErrorResponseBuilder:
    """에러 응답을 생성하는 헬퍼 클래스입니다."""
    
    @staticmethod
    def create_response(problem_data: Any, status_code: int):
        """Problem Details 응답을 생성합니다."""
        from flask import jsonify
        
        if isinstance(problem_data, ProblemDetail):
            response_data = problem_data.to_dict()
        elif isinstance(problem_data, dict):
            response_data = problem_data
        else:
            # 기본 응답 형식
            response_data = {
                "type": f"{ProblemDetailBuilder.BASE_URI}/UNKNOWN_ERROR",
                "title": "Unknown Error",
                "status": status_code,
                "detail": str(problem_data),
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
        
        # 요청 ID 추가 (있는 경우)
        if hasattr(request, 'request_id'):
            response_data["request_id"] = request.request_id
        
        response = jsonify(response_data)
        response.status_code = status_code
        response.headers['Content-Type'] = 'application/problem+json'
        
        return response
    
    @staticmethod
    def get_status_code_for_exception(exception) -> int:
        """예외 타입에 따라 적절한 HTTP 상태 코드를 반환합니다."""
        from exceptions.custom_exceptions import (
            InvalidAPIKeyError, AuthenticationError, AuthorizationError,
            ValidationError, ResourceNotFoundError, WorkspaceNotFoundError,
            ModelNotFoundError, RateLimitError, QueueFullError,
            ImageProcessingError, FileSystemError, ConfigurationError,
            InsufficientDataError, ExternalServiceError,
            BaseCustomException
        )
        
        status_code_mapping = {
            InvalidAPIKeyError: 401,
            AuthenticationError: 401,
            AuthorizationError: 403,
            ValidationError: 400,
            ConfigurationError: 400,
            ImageProcessingError: 400,
            FileSystemError: 400,
            InsufficientDataError: 400,
            ResourceNotFoundError: 404,
            WorkspaceNotFoundError: 404,
            ModelNotFoundError: 404,
            RateLimitError: 429,
            QueueFullError: 503,
            ExternalServiceError: 502,
            BaseCustomException: 500
        }
        
        for exception_type, status_code in status_code_mapping.items():
            if isinstance(exception, exception_type):
                return status_code
        
        return 500