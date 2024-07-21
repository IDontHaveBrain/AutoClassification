def get_image_classification_tool(categories):
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
                                    "enum": categories + ["NONE"]
                                }
                            },
                            "required": ["index", "category"]
                        },
                        "description": "The classifications for each image, including their index. Use 'NONE' if no category fits."
                    }
                },
                "required": ["classifications"]
            }
        }
    }
