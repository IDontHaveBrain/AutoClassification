from .base import BaseConfig

class TestingConfig(BaseConfig):
    """Testing configuration."""
    TESTING = True
    DEBUG = True
    DATABASE_URI = "sqlite:///test.db"
    LOG_LEVEL = "DEBUG"
