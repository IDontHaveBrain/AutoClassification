from services.classification_service import ClassificationService
from services.image_service import ImageService
from config import Config

class Container:
    def __init__(self):
        self.config = Config()
        self.image_service = ImageService()
        self.classification_service = ClassificationService()
