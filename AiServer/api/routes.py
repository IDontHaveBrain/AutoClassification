from flask import Blueprint, request, jsonify
from utils.logger import get_logger
from services.data_processor import DataProcessor
from config import config

api_bp = Blueprint('api', __name__)
logger = get_logger(__name__)

# Initialize data processor
data_processor = DataProcessor()

def validate_api_key():
    """
    API 키를 검증하는 헬퍼 함수.
    
    Returns:
        bool: API 키가 유효하면 True, 그렇지 않으면 False
    """
    api_key = request.headers.get("x-api-key")
    return api_key and api_key == config.API_KEY

@api_bp.route('/health', methods=['GET'])
def health_check():
    """
    헬스 체크 엔드포인트.

    Returns:
        tuple: 응답 문자열과 HTTP 상태 코드를 포함하는 튜플.
    """
    return "OK", 200

@api_bp.route('/api/testclassify', methods=['POST'])
def test_classify():
    """
    테스트 분류 엔드포인트.
    
    이미지들을 분류하지만 결과를 저장하지 않는 테스트용 엔드포인트입니다.
    
    Request Body:
        testClass (List[str]): 분류에 사용할 카테고리 목록
        testImages (List[dict]): 분류할 이미지 정보 목록
            - id (str): 이미지 ID
            - url (str): 이미지 URL
            - fileName (str): 이미지 파일명
    
    Returns:
        List[dict]: 분류 결과 목록
            - label (str): 분류된 레이블
            - ids (List[str]): 해당 레이블로 분류된 이미지 ID 목록
    """
    logger.info("Test classification request received")
    print("DEBUG: Test classification request received in enhanced version")
    
    if not validate_api_key():
        print("DEBUG: API key validation failed")
        logger.error("API key validation failed")
        return jsonify({"message": "유효하지 않은 API 키"}), 403
    
    print("DEBUG: API key validation passed")
    logger.info("API key validation passed")
    data = request.json
    print(f"DEBUG: Request contains {len(data.get('testImages', []))} test images")
    logger.info(f"Request contains {len(data.get('testImages', []))} test images")
    
    try:
        result = data_processor.process_data(request, "test")
        logger.info(f"Test classification completed with {len(result)} results")
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Test classification error: {e}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return jsonify({"message": "분류 중 오류가 발생했습니다.", "error": str(e)}), 500

@api_bp.route('/api/classify', methods=['POST'])
def classify():
    """
    분류 엔드포인트.
    
    이미지들을 분류하고 결과를 저장하는 엔드포인트입니다.
    
    Request Body:
        testClass (List[str]): 분류에 사용할 카테고리 목록
        testImages (List[dict]): 분류할 이미지 정보 목록
            - id (str): 이미지 ID
            - url (str): 이미지 URL
            - fileName (str): 이미지 파일명
        workspaceId (int): 작업공간 ID
        requesterId (int): 요청자 ID
    
    Returns:
        List[dict]: 분류 결과 목록
            - label (str): 분류된 레이블
            - ids (List[str]): 해당 레이블로 분류된 이미지 ID 목록
    """
    if not validate_api_key():
        return jsonify({"message": "유효하지 않은 API 키"}), 403
    
    try:
        logger.info("Classification request received")
        result = data_processor.process_data(request, "classify")
        logger.info(f"Classification completed with {len(result)} results")
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Classification error: {e}")
        return jsonify({"message": "분류 중 오류가 발생했습니다.", "error": str(e)}), 500

@api_bp.route('/api/train', methods=['POST'])
def train():
    """
    훈련 엔드포인트.
    
    YOLO 모델 훈련을 시작하는 엔드포인트입니다.
    
    Request Body:
        workspaceId (int): 훈련할 작업공간 ID
        requesterId (int): 요청자 ID (옵션)
        classes (List[str]): 훈련할 클래스 목록 (옵션)
        epochs (int): 훈련 에포크 수 (기본값: 10)
        imgsz (int): 이미지 크기 (기본값: 416)
    
    Returns:
        dict: 훈련 시작 응답
            - message (str): 응답 메시지
            - workspaceId (int): 작업공간 ID
    """
    if not validate_api_key():
        return jsonify({"message": "유효하지 않은 API 키"}), 403
    
    try:
        data = request.json
        workspace_id = data.get("workspaceId")
        
        if not workspace_id:
            return jsonify({"message": "workspaceId가 필요합니다."}), 400
        
        logger.info(f"Training request received for workspace {workspace_id}")
        
        # 훈련 로직은 RabbitMQ를 통해 비동기로 처리되므로
        # 여기서는 훈련 시작 응답만 반환
        response = {
            "message": "데이터 훈련 중...",
            "workspaceId": workspace_id
        }
        
        logger.info(f"Training initiated for workspace {workspace_id}")
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"Training error: {e}")
        return jsonify({"message": "훈련 시작 중 오류가 발생했습니다.", "error": str(e)}), 500
