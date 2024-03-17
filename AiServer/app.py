from flask import Flask, request, jsonify
from openai import OpenAI
from datetime import datetime
from ultralytics import YOLO
import os, json, requests, base64

app = Flask(__name__)

if os.name == 'nt':
    base_dir = "C:/AutoClass"
else:
    base_dir = "/data/autoClass"

API_KEY = "test"

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

        file_name = f"{label}.txt"
        file_path = os.path.join(dir_path, file_name)

        response = requests.get(image)
        image_path = os.path.join(dir_path, f"{label}_{datetime.now().strftime('%Y%m%d%H%M%S%f')}.jpg")
        with open(image_path, 'wb') as img_file:
            img_file.write(response.content)

        with open(file_path, 'a') as file:
            data = {"name": label, "image": image_path}
            file.write(json.dumps(data) + '\n')

    return {"labels": labels, "images": images}


def is_url_image(image_url):
    image_formats = ("image/png", "image/jpeg", "image/jpg")
    r = requests.head(image_url)
    if r.headers["content-type"] in image_formats:
        return True
    return False


def encode_image(url):
    response = requests.get(url)
    image_content = response.content
    base64_image = base64.b64encode(image_content)
    return base64_image.decode('utf-8')


@app.route('/api/train', methods=['POST'])
def train_data():
    api_key = request.headers.get('x-api-key')
    if not api_key or api_key != API_KEY:
        return jsonify({'message': 'Invalid API key'}), 403

    data = request.get_json()
    for key in data:
        print(f'{key}: {data[key]}')

    testClass = data.get('testClass', [])
    testImages = data.get('testImages', [])
    print(f'testClass: {testClass}')
    print(f'testImages: {testImages}')

    filtered_images = [img for img in testImages if is_url_image(img)]
    # filtered_images = testImages
    encoded_images = [encode_image(url) for url in filtered_images]

    client = OpenAI()
    completion = client.chat.completions.create(
        model="gpt-4-vision-preview",
        messages=[
            {
                "role": "user",
                "content": [
                               {"type": "text",
                                "text": "You are an AI model that classifies images that are closest to the list I provide. To answer, "
                                        "just say the words from the list I provided with ',' separator. The list I provide : "
                                        + ','.join(testClass)},
                           ] + [
                               {"type": "image_url",
                                "image_url": {"url": f"data:image/jpeg;base64,{img}", "detail": "low"}} for img in
                               encoded_images
                           ],
            }
        ],
        max_tokens=1024,
    )

    resultJson = completion.model_dump_json()
    print(resultJson)

    print(completion.choices[0].message)
    labels = check_inclusion(completion.choices[0].message.content.split(','), testClass)
    set_labels(labels, testImages)

    return resultJson


@app.route('/')
def hello_world():
    api_key = request.headers.get('x-api-key')
    if not api_key or api_key != API_KEY:
        return jsonify({'message': 'Invalid API key'}), 403

    return 'Hello, World!'


if __name__ == '__main__':
    app.run()
