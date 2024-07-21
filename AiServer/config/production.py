from .base import BaseConfig

class ProductionConfig(BaseConfig):
    """Production configuration."""
    DEBUG = False
    TESTING = False
    DATABASE_URI = "postgresql://user:password@localhost/prod_db"
    LOG_LEVEL = "ERROR"
