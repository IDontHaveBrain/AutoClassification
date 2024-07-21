from ultralytics import YOLO
from config import config
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def validate_model():
    """
    YOLO 모델을 로드하고 검증하는 함수입니다.
    """
    logger.info("YOLO 모델 검증 시작")
    model = YOLO(f"{config.BASE_DIR}/runs/classify/train4/weights/best.pt")
    logger.info(f"모델 정보: {model.info()}")

    metrics = model.val()  # 데이터셋과 설정이 기억됨
    logger.info(f"Top-1 정확도: {metrics.top1:.4f}")
    logger.info(f"Top-5 정확도: {metrics.top5:.4f}")
    logger.info(f"전체 메트릭스: {metrics}")
    logger.info("YOLO 모델 검증 완료")

if __name__ == "__main__":
    validate_model()
