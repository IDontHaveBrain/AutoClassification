from flask import jsonify
from openai import OpenAI
import time
import config
from ImageProcessor import ImageProcessor
from RabbitMq import RabbitMQHandler


class DataProcessor:
    @staticmethod
    def process_data(request, operation, properties):
        api_key = request.headers.get('x-api-key')
        if not api_key or api_key != config.API_KEY:
            return jsonify({'message': 'Invalid API key'}), 403

        data = request.json
        workspaceId = data.get('workspaceId')
        testClass = data.get('testClass', [])
        testDtos = data.get('testImages', [])
        testImages = [dto['url'] for dto in testDtos]

        filtered_dto_image_pairs = [(dto, url) for dto, url in zip(testDtos, testImages) if ImageProcessor.is_url_image(url)]
        chunks = DataProcessor.chunk_list(filtered_dto_image_pairs, 15)

        labels_to_ids = DataProcessor.process_chunks(chunks, testClass, operation, workspaceId)

        labels_and_ids = [{'label': label, 'ids': ids} for label, ids in labels_to_ids.items()]

        return labels_and_ids

    @staticmethod
    def chunk_list(lst, n):
        for i in range(0, len(lst), n):
            yield lst[i:i + n]

    @staticmethod
    def process_chunks(chunks, testClass, operation, workspaceId=0):
        client = OpenAI()
        all_labels = []
        labels_to_ids = {}

        for chunk in chunks:
            images_for_ai = DataProcessor.prepare_images_for_ai(chunk)

            try:
                start_time = time.time()
                completion = client.chat.completions.create(
                    model="gpt-4-vision-preview",
                    messages=[
                        {
                            "role": "user",
                            "content": [
                                           {"type": "text",
                                            "text": "You are an AI model that classifies the images closest to the list I provide."
                                                    + "Your answer is always one of the words I provide or none, and you have to use ',' as a separator."
                                                    + "You must return the same amount of words as the number of images entered."
                                                    + "If you are not close to any of the lists you provided, you should return none to maintain the same number of answers as the number of images."
                                                    + "Example (if there are 10 images and the provided list is 'cat, dog, duck') - dog, cat, dog, dog, cat, duck, duck, dog, duck, cat"
                                                    + "The words I provide : "
                                                    + ','.join(testClass)},
                                       ] + images_for_ai,
                        }
                    ],
                    max_tokens=2048,
                )
                end_time = time.time()
                print(f"Duration: {end_time - start_time} seconds")
            except Exception as e:
                print(f"Error processing images: {e}")
                for _, url in chunk:
                    print(f"Image URL: {url}")
                raise

            chunk_labels = ImageProcessor.check_inclusion(completion.choices[0].message.content.split(','), testClass)
            all_labels.extend(chunk_labels)

            if operation != 'test':
                ImageProcessor.set_labels(chunk_labels, chunk, workspaceId)

                for label, dto_url_tuple in zip(chunk_labels, chunk):
                    dto, url = dto_url_tuple
                    if 'id' in dto:
                        if label in labels_to_ids:
                            labels_to_ids[label].append(dto['id'])
                        else:
                            labels_to_ids[label] = [dto['id']]
                    else:
                        print(f"'id' is not found in dto: {dto}")

        return labels_to_ids

    @staticmethod
    def prepare_images_for_ai(chunk):
        images_for_ai = []
        for _, url in chunk:
            if 'localhost' in url:
                img = ImageProcessor.encode_image(url)
                images_for_ai.append({"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img}", "detail": "low"}})
            else:
                images_for_ai.append({"type": "image_url", "image_url": {"url": url, "detail": "low"}})
        return images_for_ai