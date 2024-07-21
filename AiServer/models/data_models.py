from pydantic import BaseModel
from typing import List, Optional

class ImageDto(BaseModel):
    """
    Data Transfer Object for image information.

    Attributes:
        id (str): Unique identifier for the image.
        url (str): URL where the image can be accessed.
        fileName (str): Name of the image file.
    """
    id: str
    url: str
    fileName: str

class ClassificationRequest(BaseModel):
    """
    Model for a classification request.

    Attributes:
        workspaceId (int): ID of the workspace where the classification is performed.
        testClass (List[str]): List of classification categories to test against.
        testImages (List[ImageDto]): List of images to be classified.
    """
    workspaceId: int
    testClass: List[str]
    testImages: List[ImageDto]

class ClassificationResult(BaseModel):
    """
    Model for a single classification result.

    Attributes:
        label (str): The classification label assigned.
        ids (List[str]): List of image IDs that were classified with this label.
    """
    label: str
    ids: List[str]

class ClassificationResponse(BaseModel):
    """
    Model for the overall classification response.

    Attributes:
        labels_and_ids (List[ClassificationResult]): List of classification results.
    """
    labels_and_ids: List[ClassificationResult]
