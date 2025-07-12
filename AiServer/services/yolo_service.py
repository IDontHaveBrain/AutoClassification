from ultralytics import YOLO
from config import config
import os
import logging
import json
from datetime import datetime
import torch
from exceptions.custom_exceptions import ModelNotFoundError, ExportError

logger = logging.getLogger(__name__)

class YOLOService:
    """
    YOLO 모델 훈련 및 추론을 처리하는 서비스 클래스.

    이 클래스는 YOLO 모델의 훈련, 검증, 추론 기능을 제공합니다.
    """

    def __init__(self):
        """
        YOLOService 인스턴스를 초기화합니다.
        """
        self.model = None
        self.models_dir = os.path.join(config.BASE_DIR, "models")
        os.makedirs(self.models_dir, exist_ok=True)
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"Using device: {self.device}")

    def train(self, workspace_id, epochs=10, imgsz=416, batch_size=16, progress_callback=None):
        """
        지정된 작업 공간의 데이터로 YOLO 모델을 훈련합니다.

        Args:
            workspace_id (int): 훈련 데이터가 있는 작업 공간의 ID.
            epochs (int): 훈련 에포크 수. 기본값은 10.
            imgsz (int): 입력 이미지 크기. 기본값은 416.
            batch_size (int): 배치 크기. 기본값은 16.
            progress_callback (callable): 훈련 진행 상황을 보고하기 위한 콜백 함수.

        Returns:
            dict: 훈련 결과 및 메트릭스.
        """
        workspace_dir = os.path.join(config.BASE_DIR, "workspace", str(workspace_id))
        self.model = YOLO("yolov8n-cls.pt").to(self.device)  # 분류 모델 사용

        def on_train_epoch_end(trainer):
            if progress_callback:
                progress = {
                    "status": "in_progress",
                    "epoch": trainer.epoch,
                    "epochs": trainer.epochs,
                    "metrics": trainer.metrics
                }
                progress_callback(progress)

        def on_train_end(trainer):
            if progress_callback:
                progress = {
                    "status": "completed",
                    "epoch": trainer.epoch,
                    "epochs": trainer.epochs,
                    "metrics": trainer.metrics
                }
                progress_callback(progress)

        results = self.model.train(
            data=workspace_dir,
            epochs=epochs,
            imgsz=imgsz,
            batch=batch_size,
            device=self.device,
            callbacks={
                'on_train_epoch_end': on_train_epoch_end,
                'on_train_end': on_train_end
            }
        )

        # 모델 버전 관리 및 저장
        version = datetime.now().strftime("%Y%m%d_%H%M%S")
        model_path = os.path.join(self.models_dir, f"model_{workspace_id}_{version}.pt")
        self.model.save(model_path)

        # 훈련 결과 저장
        results_path = os.path.join(self.models_dir, f"results_{workspace_id}_{version}.json")
        with open(results_path, 'w') as f:
            json.dump({
                "metrics": results.metrics,
                "best_accuracy": results.best_accuracy,
                "final_accuracy": results.final_accuracy
            }, f)

        return {
            "metrics": results.metrics,
            "best_accuracy": results.best_accuracy,
            "final_accuracy": results.final_accuracy,
            "model_version": version
        }

    def validate(self, workspace_id, version=None):
        """
        훈련된 모델을 검증합니다.

        Args:
            workspace_id (int): 검증 데이터가 있는 작업 공간의 ID.
            version (str, optional): 검증할 모델의 버전. 기본값은 None (최신 버전 사용).

        Returns:
            dict: 검증 결과 및 메트릭스.
        """
        model_path = self._get_model_path(workspace_id, version)
        self.model = YOLO(model_path).to(self.device)
        workspace_dir = os.path.join(config.BASE_DIR, "workspace", str(workspace_id))
        results = self.model.val(data=workspace_dir, device=self.device)

        return {
            "metrics": results.metrics,
            "accuracy": results.accuracy,
            "model_version": version or self._get_latest_version(workspace_id)
        }

    def predict(self, image_path, workspace_id, version=None):
        """
        단일 이미지에 대해 예측을 수행합니다.

        Args:
            image_path (str): 예측할 이미지의 경로.
            workspace_id (int): 사용할 모델의 작업 공간 ID.
            version (str, optional): 사용할 모델의 버전. 기본값은 None (최신 버전 사용).

        Returns:
            dict: 예측 결과.
        """
        model_path = self._get_model_path(workspace_id, version)
        self.model = YOLO(model_path).to(self.device)
        results = self.model.predict(image_path, device=self.device)
        return {
            "prediction": results[0].todict(),
            "model_version": version or self._get_latest_version(workspace_id)
        }

    def _get_model_path(self, workspace_id, version=None):
        """
        지정된 작업 공간 및 버전에 대한 모델 경로를 반환합니다.

        Args:
            workspace_id (int): 작업 공간 ID.
            version (str, optional): 모델 버전. 기본값은 None (최신 버전 사용).

        Returns:
            str: 모델 파일 경로.

        Raises:
            ModelNotFoundError: 모델을 찾을 수 없는 경우.
        """
        if version is None:
            version = self._get_latest_version(workspace_id)

        model_path = os.path.join(self.models_dir, f"model_{workspace_id}_{version}.pt")
        if not os.path.exists(model_path):
            raise ModelNotFoundError(
                f"버전 {version}의 모델을 찾을 수 없습니다.",
                model_name=f"model_{workspace_id}_{version}",
                version=version,
                details={
                    'workspace_id': workspace_id,
                    'model_path': model_path
                }
            )
        return model_path

    def _get_latest_version(self, workspace_id):
        """
        지정된 작업 공간에 대한 최신 모델 버전을 반환합니다.

        Args:
            workspace_id (int): 작업 공간 ID.

        Returns:
            str: 최신 모델 버전.

        Raises:
            ModelNotFoundError: 훈련된 모델이 없는 경우.
        """
        model_files = [f for f in os.listdir(self.models_dir) if f.startswith(f"model_{workspace_id}_")]
        if not model_files:
            raise ModelNotFoundError(
                f"작업 공간 {workspace_id}에 대한 훈련된 모델이 없습니다.",
                model_name=f"model_{workspace_id}",
                details={
                    'workspace_id': workspace_id,
                    'models_dir': self.models_dir
                }
            )
        return max(model_files).split('_')[2].split('.')[0]

    def get_model_versions(self, workspace_id):
        """
        특정 작업 공간에 대한 모든 모델 버전을 반환합니다.

        Args:
            workspace_id (int): 작업 공간 ID.

        Returns:
            list: 모델 버전 목록.
        """
        model_files = [f for f in os.listdir(self.models_dir) if f.startswith(f"model_{workspace_id}_")]
        versions = [f.split('_')[2].split('.')[0] for f in model_files]
        return sorted(versions, reverse=True)

    def export_model(self, workspace_id, version=None, format='onnx'):
        """
        훈련된 모델을 지정된 형식으로 내보냅니다.

        Args:
            workspace_id (int): 작업 공간 ID.
            version (str, optional): 내보낼 모델의 버전. 기본값은 None (최신 버전 사용).
            format (str, optional): 내보낼 모델의 형식. 기본값은 'onnx'.

        Returns:
            str: 내보낸 모델 파일의 경로.

        Raises:
            ExportError: 지원되지 않는 형식이 지정된 경우.
        """
        model_path = self._get_model_path(workspace_id, version)
        self.model = YOLO(model_path)

        if format.lower() not in ['onnx', 'torchscript', 'tflite']:
            raise ExportError(
                f"지원되지 않는 내보내기 형식: {format}",
                model_name=f"model_{workspace_id}_{version or 'latest'}",
                export_format=format,
                details={
                    'workspace_id': workspace_id,
                    'supported_formats': ['onnx', 'torchscript', 'tflite']
                }
            )

        export_path = os.path.join(self.models_dir, f"exported_{workspace_id}_{version or 'latest'}.{format.lower()}")
        self.model.export(format=format, save_dir=os.path.dirname(export_path), filename=os.path.basename(export_path))

        logger.info(f"Model export successful: {export_path}")
        return export_path

