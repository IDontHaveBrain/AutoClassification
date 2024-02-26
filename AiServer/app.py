from flask import Flask
from openai import OpenAI
import os, json, requests

app = Flask(__name__)

base_dir = "C:/AutoClass"

def check_inclusion(labels, class_list):
    result = []
    for word in labels:
        if any(test_word in word for test_word in class_list):
            result.append(next((test_word for test_word in class_list if test_word in word), 'none'))
        else:
            result.append('none')
    return result

def set_labels(labels, images):
    for label, image in zip(labels, images):
        dir_path = os.path.join(base_dir, label)
        os.makedirs(dir_path, exist_ok=True)
        file_path = os.path.join(dir_path, label + '.txt')

        response = requests.get(image)
        image_path = os.path.join(dir_path, label + '.jpg')
        with open(image_path, 'wb') as img_file:
            img_file.write(response.content)

        with open(file_path, 'a') as file:
            data = {"name": label, "image": image_path}
            file.write(json.dumps(data) + '\n')

        # with open(file_path, 'a') as file:
        #     data = {"name": label, "image": image}
        #     file.write(json.dumps(data) + '\n')

    return {"labels": labels, "images": images}

@app.route('/')
def hello_world():
    # client = OpenAI()
    # defaults to getting the key using os.environ.get("OPENAI_API_KEY")
    # if you saved the key under a different environment variable name, you can do something like:
    client = OpenAI()

    testClass = ["cat", "dog", "wolf"]
    testImages = [
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSI3xUdHDZK8vn_GPB43oFN0Lbd3bykTt0DJQ&usqp=CAU",
        "https://image.dongascience.com/Photo/2022/11/0c265e639aabe3a9e3105bc551007009.jpg",
    ]

    completion = client.chat.completions.create(
        model="gpt-4-vision-preview",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "You are an AI model that classifies images that are closest to the list I provide. To answer, "
                                             "just say the words from the list I provided with ',' separator. The list I provide : "
                                             + ','.join(testClass)},
                    # {
                    #     "type": "image_url",
                    #     "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSI3xUdHDZK8vn_GPB43oFN0Lbd3bykTt0DJQ&usqp=CAU"
                    # },
                    # {
                    #     "type": "image_url",
                    #     "image_url": "https://image.dongascience.com/Photo/2022/11/0c265e639aabe3a9e3105bc551007009.jpg"
                    # },
                ] + [
                    {"type": "image_url", "image_url": url} for url in testImages
                ],
            }
        ],
        # tools=tools,
    )

    resultJson = completion.model_dump_json()
    print(resultJson)

    print(completion.choices[0].message)

    labels = check_inclusion(completion.choices[0].message.content.split(','), testClass)

    set_labels(labels, testImages)

    return resultJson


if __name__ == '__main__':
    app.run()
