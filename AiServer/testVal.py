from ultralytics import YOLO
from config import config
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def validate_model():
    """
    YOLO 모델을 로드하고 검증하는 함수입니다.
    """
    logger.info("YOLO model validation started")
    model = YOLO(f"{config.BASE_DIR}/runs/classify/train4/weights/best.pt")
    logger.info(f"Model info: {model.info()}")

    metrics = model.val()  # 데이터셋과 설정이 기억됨
    logger.info(f"Top-1 accuracy: {metrics.top1:.4f}")
    logger.info(f"Top-5 accuracy: {metrics.top5:.4f}")
    logger.info(f"Full metrics: {metrics}")
    logger.info("YOLO model validation completed")

if __name__ == "__main__":
    validate_model()
