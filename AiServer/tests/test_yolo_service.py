import unittest
from unittest.mock import patch, MagicMock
import os
import json
from services.yolo_service import YOLOService
from config import config

class TestYOLOService(unittest.TestCase):
    def setUp(self):
        self.yolo_service = YOLOService()
        self.test_workspace_id = 1
        self.test_model_version = "20230101_000000"

    @patch('services.yolo_service.YOLO')
    def test_train(self, mock_yolo):
        mock_model = MagicMock()
        mock_model.train.return_value = MagicMock(
            metrics={"accuracy": 0.95},
            best_accuracy=0.96,
            final_accuracy=0.95
        )
        mock_yolo.return_value = mock_model

        def progress_callback(progress):
            self.assertIn("status", progress)
            self.assertIn("epoch", progress)
            self.assertIn("epochs", progress)
            self.assertIn("metrics", progress)

        result = self.yolo_service.train(self.test_workspace_id, progress_callback=progress_callback)

        self.assertIn("metrics", result)
        self.assertIn("best_accuracy", result)
        self.assertIn("final_accuracy", result)
        self.assertIn("model_version", result)

        # 모델 및 결과 파일 저장 확인
        model_file = os.path.join(self.yolo_service.models_dir, f"model_{self.test_workspace_id}_{result['model_version']}.pt")
        results_file = os.path.join(self.yolo_service.models_dir, f"results_{self.test_workspace_id}_{result['model_version']}.json")
        self.assertTrue(os.path.exists(model_file))
        self.assertTrue(os.path.exists(results_file))

        # 결과 파일 내용 확인
        with open(results_file, 'r') as f:
            saved_results = json.load(f)
        self.assertEqual(saved_results["metrics"], result["metrics"])
        self.assertEqual(saved_results["best_accuracy"], result["best_accuracy"])
        self.assertEqual(saved_results["final_accuracy"], result["final_accuracy"])

    @patch('services.yolo_service.YOLO')
    def test_validate(self, mock_yolo):
        mock_model = MagicMock()
        mock_model.val.return_value = MagicMock(
            metrics={"accuracy": 0.95},
            accuracy=0.95
        )
        mock_yolo.return_value = mock_model

        result = self.yolo_service.validate(self.test_workspace_id, self.test_model_version)

        self.assertIn("metrics", result)
        self.assertIn("accuracy", result)
        self.assertIn("model_version", result)

    @patch('services.yolo_service.YOLO')
    def test_predict(self, mock_yolo):
        mock_model = MagicMock()
        mock_model.predict.return_value = [MagicMock(todict=lambda: {"class": "cat", "confidence": 0.95})]
        mock_yolo.return_value = mock_model

        result = self.yolo_service.predict("test_image.jpg", self.test_workspace_id, self.test_model_version)

        self.assertIn("prediction", result)
        self.assertIn("model_version", result)

    def test_get_model_versions(self):
        # 모의 모델 파일 생성
        os.makedirs(self.yolo_service.models_dir, exist_ok=True)
        open(os.path.join(self.yolo_service.models_dir, f"model_{self.test_workspace_id}_{self.test_model_version}.pt"), 'a').close()

        versions = self.yolo_service.get_model_versions(self.test_workspace_id)

        self.assertIn(self.test_model_version, versions)

    def test_train_with_invalid_workspace(self):
        with self.assertRaises(ValueError):
            self.yolo_service.train(-1)

    def test_validate_with_nonexistent_model(self):
        with self.assertRaises(ValueError):
            self.yolo_service.validate(self.test_workspace_id, "nonexistent_version")

    def test_predict_with_nonexistent_model(self):
        with self.assertRaises(ValueError):
            self.yolo_service.predict("test_image.jpg", self.test_workspace_id, "nonexistent_version")

    def tearDown(self):
        # 테스트 후 정리
        if os.path.exists(self.yolo_service.models_dir):
            for file in os.listdir(self.yolo_service.models_dir):
                os.remove(os.path.join(self.yolo_service.models_dir, file))
            os.rmdir(self.yolo_service.models_dir)

if __name__ == '__main__':
    unittest.main()
