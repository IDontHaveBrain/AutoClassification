from flask import Blueprint
from utils.logger import get_logger

api_bp = Blueprint('api', __name__)
logger = get_logger(__name__)

@api_bp.route('/health', methods=['GET'])
def health_check():
    """
    헬스 체크 엔드포인트.

    Returns:
        tuple: 응답 문자열과 HTTP 상태 코드를 포함하는 튜플.
    """
    return "정상", 200
