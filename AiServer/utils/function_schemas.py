def get_image_classification_tool(categories):
    """
    이미지 분류를 위한 함수 스키마를 생성합니다.

    이 함수는 API 호출에 사용되는 이미지 분류 함수의 구조와 제약 조건을
    정의하는 스키마를 생성합니다.

    Args:
        categories (list): 유효한 분류 카테고리 목록.

    Returns:
        dict: 이미지 분류를 위한 함수 스키마를 나타내는 딕셔너리.
    """
    return {
        "type": "function",
        "function": {
            "name": "classify_images",
            "description": "Classify images into predefined categories",
            "parameters": {
                "type": "object",
                "properties": {
                    "classifications": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "index": {"type": "integer"},
                                "category": {
                                    "type": "string",
                                    "enum": categories + ["NONE"],
                                },
                            },
                            "required": ["index", "category"],
                        },
                        "description": "The classifications for each image, including their index. Use 'NONE' if no category fits.",
                    }
                },
                "required": ["classifications"],
            },
        },
    }
