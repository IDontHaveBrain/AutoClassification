from .base import BaseConfig

class DevelopmentConfig(BaseConfig):
    """Development configuration."""
    DEBUG = True
    TESTING = False
    DATABASE_URI = "sqlite:///dev.db"
    LOG_LEVEL = "DEBUG"
