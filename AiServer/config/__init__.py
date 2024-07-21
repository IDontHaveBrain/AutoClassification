import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Determine the current environment
ENV = os.getenv('FLASK_ENV', 'development')

# Import the appropriate configuration
if ENV == 'production':
    from .production import ProductionConfig as Config
elif ENV == 'testing':
    from .testing import TestingConfig as Config
else:
    from .development import DevelopmentConfig as Config

# Create a config object
config = Config()

# Override config values with environment variables
for key in dir(config):
    if key.isupper():
        env_value = os.getenv(key)
        if env_value is not None:
            setattr(config, key, env_value)
