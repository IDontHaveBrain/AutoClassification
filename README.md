# AutoClassification

This project utilizes OpenAI API and YOLOv8 for automatic labeling and training of Classification models with CustomDataSet.

## Features

- Automatic image classification using OpenAI's GPT-4 Vision
- Custom dataset creation and management
- YOLOv8 model training for specific classification tasks
- RESTful API for classification and training operations
- RabbitMQ integration for asynchronous processing
- Optimized for performance with concurrent processing and improved error handling
- Structured logging system for better debugging and monitoring

## Getting Started

### Prerequisites

- Python 3.11+
- Docker (optional)
- RabbitMQ server

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/AutoClassification.git
   cd AutoClassification
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in the required variables (see `config.py` for details)

### Running the Application

1. Start the Flask server:
   ```
   python AiServer/app.py
   ```

2. (Optional) Run with Docker:
   ```
   docker-compose up --build
   ```

## API Endpoints

- `/api/classify`: POST - Classify images
- `/api/testclassify`: POST - Test classification without saving results
- `/api/train`: POST - Train model on a workspace
- `/health`: GET - Health check

## Project Structure

- `AiServer/`: Main application directory
  - `api/`: API routes and error handlers
  - `services/`: Business logic and data processing
  - `models/`: Data models
  - `utils/`: Utility functions and helpers
  - `exceptions/`: Custom exception classes
  - `tests/`: Unit and integration tests (in progress)
  - `config.py`: Configuration management

## Performance Optimization

The application has been optimized for better performance:
- Concurrent processing of image chunks with increased parallelism
- Improved RabbitMQ connection handling with retries and error recovery
- Asynchronous image processing and classification with enhanced concurrency
- Optimized image resizing for API requests
- Efficient memory usage through streaming responses

## Testing

Access the test environment at [https://toy.dev.nobrain.cc/sign-in](https://toy.dev.nobrain.cc/sign-in)

Test credentials:
- Username: test@test.com
- Password: 123123!

To run the unit tests:
```
python -m unittest discover AiServer/tests
```

Our test suite now includes:
- Unit tests for ClassificationService
- Unit tests for ImageService
- Unit tests for DataProcessor
- Integration tests for API endpoints (in progress)

We continuously improve our test coverage to ensure the reliability and stability of the application.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Troubleshooting

If you encounter any issues, please check the following:
- Ensure all environment variables are correctly set
- Check RabbitMQ server is running and accessible
- Verify OpenAI API key is valid and has sufficient credits
- For Docker users, ensure Docker daemon is running

For more detailed logs, set the log level to DEBUG in the configuration.
