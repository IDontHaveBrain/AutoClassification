from ultralytics import YOLO
from config import config
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def main():
    """
    YOLO 모델을 로드하고 훈련시키는 메인 함수입니다.
    """
    logger.info("YOLO 모델 훈련 시작")
    model = YOLO('yolov8s-cls.yaml').load('yolov8s-cls.pt')
    logger.info(f"모델 정보: {model.info()}")

    results = model.train(
        data=f"{config.BASE_DIR}/workspace/test",
        epochs=30,
        imgsz=512,
        batch=-1
    )
    logger.info(f"YOLO 모델 훈련 완료. 결과: {results}")

if __name__ == "__main__":
    main()
