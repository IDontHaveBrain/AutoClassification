from flask import jsonify
from openai import OpenAI

import config
from ImageProcessor import ImageProcessor


class DataProcessor:
    @staticmethod
    def process_data(request, operation):
        api_key = request.headers.get('x-api-key')
        if not api_key or api_key != config.API_KEY:
            return jsonify({'message': 'Invalid API key'}), 403

        data = request.json
        testClass = data.get('testClass', [])
        testDtos = data.get('testImages', [])
        testImages = [dto['url'] for dto in testDtos]

        filtered_dto_image_pairs = [(dto, url) for dto, url in zip(testDtos, testImages) if ImageProcessor.is_url_image(url)]
        chunks = DataProcessor.chunk_list(filtered_dto_image_pairs, 10)

        all_labels = DataProcessor.process_chunks(chunks, testClass, operation)

        labels_to_ids = ImageProcessor.get_labels_to_ids(all_labels, filtered_dto_image_pairs)
        labels_and_ids = [{'label': label, 'ids': ids} for label, ids in labels_to_ids.items()]

        return labels_and_ids

    @staticmethod
    def chunk_list(lst, n):
        for i in range(0, len(lst), n):
            yield lst[i:i + n]

    @staticmethod
    def process_chunks(chunks, testClass, operation):
        client = OpenAI()
        all_labels = []

        for chunk in chunks:
            images_for_ai = DataProcessor.prepare_images_for_ai(chunk, operation)

            try:
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
                                       ] + images_for_ai,
                        }
                    ],
                    max_tokens=2048,
                )
            except Exception as e:
                print(f"Error processing images: {e}")
                for _, url in chunk:
                    print(f"Image URL: {url}")
                raise

            chunk_labels = ImageProcessor.check_inclusion(completion.choices[0].message.content.split(','), testClass)
            all_labels.extend(chunk_labels)

            if operation == 'classify':
                ImageProcessor.set_labels(chunk_labels, chunk)  # Pass the current chunk for labeling

        return all_labels

    @staticmethod
    def prepare_images_for_ai(chunk, operation):
        if operation == 'classify':
            return [{"type": "image_url", "image_url": {"url": url, "detail": "low"}} for _, url in chunk]
        else:
            encoded_images = [ImageProcessor.encode_image(url) for _, url in chunk]
            return [
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img}", "detail": "low"}} for img in
                encoded_images]