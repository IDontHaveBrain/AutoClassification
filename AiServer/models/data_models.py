from pydantic import BaseModel
from typing import List, Optional

class ImageDto(BaseModel):
    """
    이미지 정보를 위한 데이터 전송 객체.

    속성:
        id (str): 이미지의 고유 식별자.
        url (str): 이미지에 접근할 수 있는 URL.
        fileName (str): 이미지 파일의 이름.
    """
    id: str
    url: str
    fileName: str

class ClassificationRequest(BaseModel):
    """
    분류 요청을 위한 모델.

    속성:
        workspaceId (int): 분류가 수행되는 작업 공간의 ID.
        testClass (List[str]): 테스트할 분류 카테고리 목록.
        testImages (List[ImageDto]): 분류할 이미지 목록.
    """
    workspaceId: int
    testClass: List[str]
    testImages: List[ImageDto]

class ClassificationResult(BaseModel):
    """
    단일 분류 결과를 위한 모델.

    속성:
        label (str): 할당된 분류 레이블.
        ids (List[str]): 이 레이블로 분류된 이미지 ID 목록.
    """
    label: str
    ids: List[str]

class ClassificationResponse(BaseModel):
    """
    전체 분류 응답을 위한 모델.

    속성:
        labels_and_ids (List[ClassificationResult]): 분류 결과 목록.
    """
    labels_and_ids: List[ClassificationResult]
