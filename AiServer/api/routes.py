from flask import Blueprint, request, jsonify
from services.data_processor import DataProcessor
from utils.logger import get_logger
from config import Config
from ultralytics import YOLO

api_bp = Blueprint('api', __name__)
logger = get_logger(__name__)
data_processor = DataProcessor()

@api_bp.route('/dev/test')
def test():
    """
    데이터 처리를 위한 테스트 엔드포인트.

    Returns:
        tuple: JSON 응답과 HTTP 상태 코드를 포함하는 튜플.
    """
    return jsonify(data_processor.process_data(request, "test")), 200

@api_bp.route('/api/classify', methods=['POST'])
def classify_data():
    """
    이미지 데이터 분류를 위한 엔드포인트.

    Returns:
        tuple: JSON 응답과 HTTP 상태 코드를 포함하는 튜플.
    """
    return jsonify(data_processor.process_data(request, "classify")), 200

@api_bp.route('/api/testclassify', methods=['POST'])
def test_data():
    """
    결과를 저장하지 않고 이미지 데이터를 분류하는 테스트 엔드포인트.

    Returns:
        tuple: JSON 응답과 HTTP 상태 코드를 포함하는 튜플.
    """
    return jsonify(data_processor.process_data(request, "test")), 200

@api_bp.route('/api/train', methods=['POST'])
def train_data():
    """
    YOLO 모델 훈련을 위한 엔드포인트.

    Returns:
        tuple: JSON 응답과 HTTP 상태 코드를 포함하는 튜플.
    """
    print("데이터 훈련 중...")
    model = YOLO("yolov8n-cls.pt")
    model.info()

    results = model.train(
        data=Config.BASE_DIR + "/workspace/" + str(request.json["workspaceId"]),
        epochs=10,
        imgsz=416,
    )

    return jsonify({"message": "데이터 훈련 중..."}), 200

@api_bp.route('/')
def hello_world():
    """
    API 키 검증을 위한 루트 엔드포인트.

    Returns:
        str: API 키가 유효한 경우 인사 메시지.
        tuple: API 키가 유효하지 않은 경우 JSON 응답과 HTTP 상태 코드를 포함하는 튜플.
    """
    api_key = request.headers.get("x-api-key")
    if not api_key or api_key != Config.API_KEY:
        return jsonify({"message": "유효하지 않은 API 키"}), 403

    return "안녕하세요, 세계!"

@api_bp.route('/health', methods=['GET'])
def health_check():
    """
    헬스 체크 엔드포인트.

    Returns:
        tuple: 응답 문자열과 HTTP 상태 코드를 포함하는 튜플.
    """
    return "정상", 200
