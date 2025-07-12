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
            "description": "이미지를 미리 정의된 카테고리로 분류합니다",
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
                        "description": "각 이미지의 분류 결과와 인덱스입니다. 적합한 카테고리가 없는 경우 'NONE'을 사용하세요.",
                    }
                },
                "required": ["classifications"],
            },
        },
    }
