import asyncio
import time
import logging
from flask import jsonify
from openai import AsyncOpenAI
import config
from ImageProcessor import ImageProcessor
from function_schemas import get_image_classification_tool

class DataProcessor:
    @staticmethod
    def process_data(request, operation):
        api_key = request.headers.get('x-api-key')
        if not api_key or api_key != config.API_KEY:
            return jsonify({'message': 'Invalid API key'}), 403

        data = request.json
        workspaceId = data.get('workspaceId')
        testClass = data.get('testClass', [])
        testDtos = data.get('testImages', [])
        testImages = [dto['url'] for dto in testDtos]

        filtered_dto_image_pairs = [(dto, url) for dto, url in zip(testDtos, testImages) if
                                    ImageProcessor.is_url_image(url)]
        chunks = DataProcessor.chunk_list(filtered_dto_image_pairs, 100)

        labels_to_ids = asyncio.run(DataProcessor.process_chunks(chunks, testClass, operation, workspaceId))

        labels_and_ids = [{'label': label, 'ids': ids} for label, ids in labels_to_ids.items()]

        return labels_and_ids

    @staticmethod
    def chunk_list(lst, n):
        for i in range(0, len(lst), n):
            yield lst[i:i + n]

    @staticmethod
    async def process_chunks(chunks, testClass, operation, workspaceId=0):
        client = AsyncOpenAI()
        labels_to_ids = {}

        async def process_chunk(chunk):
            images_for_ai = DataProcessor.prepare_images_for_ai(chunk)

            try:
                start_time = time.time()
                logging.info(f"Processing images... start_time: {start_time}")
                
                response = await DataProcessor.classify_images_with_tools(client, images_for_ai, testClass)
                
                end_time = time.time()
                logging.info(f"Duration: {end_time - start_time} seconds")

                chunk_labels = DataProcessor.parse_tool_response(response, testClass, len(chunk))

                if operation != 'test':
                    ImageProcessor.set_labels(chunk_labels, chunk, workspaceId)

                for label, dto_url_tuple in zip(chunk_labels, chunk):
                    dto, _ = dto_url_tuple
                    if 'id' in dto:
                        labels_to_ids.setdefault(label, []).append(dto['id'])
                    else:
                        logging.warning(f"'id' is not found in dto: {dto}")

            except Exception as e:
                logging.error(f"Error processing images: {e}")
                for _, url in chunk:
                    logging.error(f"Image URL: {url}")
                raise

        chunks_list = list(chunks)
        for i in range(0, len(chunks_list), 2):
            chunk_group = chunks_list[i:i+2]

            tasks = [process_chunk(chunk) for chunk in chunk_group]
            await asyncio.gather(*tasks)

            if i + 2 < len(chunks_list):
                await asyncio.sleep(100)

        return labels_to_ids

    @staticmethod
    async def classify_images_with_tools(client, images_for_ai, testClass):
        tool = get_image_classification_tool(testClass)
        
        try:
            response = await client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": "Classify the following images based on the provided categories. Each image is preceded by its index number."},
                            *images_for_ai
                        ],
                    }
                ],
                tools=[tool],
                tool_choice={"type": "function", "function": {"name": "classify_images"}},
            )
            return response
        except Exception as e:
            logging.error(f"Error in API call: {e}")
            raise

    @staticmethod
    def parse_tool_response(response, testClass, chunk_size):
        try:
            tool_calls = response.choices[0].message.tool_calls
            if tool_calls and tool_calls[0].function.name == "classify_images":
                classifications = eval(tool_calls[0].function.arguments)
                result = ['NONE'] * chunk_size
                for classification in classifications['classifications']:
                    index = classification['index']
                    category = classification['category']
                    if 0 <= index < chunk_size:
                        result[index] = category if category in testClass else 'NONE'
                return result
            else:
                logging.warning(f"Unexpected tool call or no tool call found")
                return ['NONE'] * chunk_size
        except Exception as e:
            logging.error(f"Error parsing tool call response: {e}")
            return ['NONE'] * chunk_size

    @staticmethod
    def prepare_images_for_ai(chunk):
        images_for_ai = []
        for index, (_, url) in enumerate(chunk):
            if 'localhost' in url:
                img = ImageProcessor.encode_image(url)
                images_for_ai.append({
                    "type": "text",
                    "text": f"Image {index}:"
                })
                images_for_ai.append({
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{img}"}
                })
            else:
                images_for_ai.append({
                    "type": "text",
                    "text": f"Image {index}:"
                })
                images_for_ai.append({
                    "type": "image_url",
                    "image_url": {"url": url}
                })
        return images_for_ai
