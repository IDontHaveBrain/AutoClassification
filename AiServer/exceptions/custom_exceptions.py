class InvalidAPIKeyError(Exception):
    """
    Exception raised when an invalid API key is provided.

    This exception is used to indicate that the API key provided
    for authentication is not valid or recognized.
    """
    pass

class ImageProcessingError(Exception):
    """
    Exception raised when there's an error processing an image.

    This exception is used to indicate issues that occur during
    image processing, such as invalid formats or corrupted data.
    """
    pass

class ClassificationError(Exception):
    """
    Exception raised when there's an error during the classification process.

    This exception is used to indicate problems that occur while
    attempting to classify images, such as model errors or unexpected outputs.
    """
    pass

class TrainingError(Exception):
    """
    Exception raised when there's an error during the model training process.

    This exception is used to indicate issues that occur during the
    training of machine learning models, such as data inconsistencies
    or computational errors.
    """
    pass
