import json
import threading
import time
import logging
from typing import Any, Dict, Optional, List
import pika
from pika.exceptions import AMQPConnectionError, AMQPError, StreamLostError
from config import config
from services.data_processor import DataProcessor
from exceptions.custom_exceptions import RabbitMQConnectionError, MessageProcessingError
from services.image_service import ImageService
from services.operation_enum import Operation
from ultralytics import YOLO
from services.yolo_service import YOLOService
from services.sse_manager import SSEManager

RABBITMQ_RESPONSE_EXCHANGE = 'ClassifyResponseExchange'
TRAIN_EXCHANGE = 'TrainExchange'
TRAIN_QUEUE = 'TrainQueue'
PROGRESS_EXCHANGE = 'ProgressExchange'
PROGRESS_QUEUE = 'ProgressQueue'

logger = logging.getLogger(__name__)

class RabbitMQConnection:
    """
    RabbitMQ 연결을 관리하는 싱글톤 클래스.

    이 클래스는 RabbitMQ 서버와의 연결을 관리하고, 연결 및 채널 객체를 제공합니다.
    싱글톤 패턴을 사용하여 애플리케이션 전체에서 하나의 연결 인스턴스만 유지합니다.

    Attributes:
        _instance (Optional[RabbitMQConnection]): 싱글톤 인스턴스.
        _lock (threading.Lock): 스레드 안전성을 위한 락 객체.
        _connection (Optional[pika.BlockingConnection]): RabbitMQ 연결 객체.
        _channel (Optional[pika.channel.Channel]): RabbitMQ 채널 객체.
        _last_connection_attempt (float): 마지막 연결 시도 시간.
    """

    _instance: Optional['RabbitMQConnection'] = None
    _lock = threading.Lock()

    def __new__(cls) -> 'RabbitMQConnection':
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(RabbitMQConnection, cls).__new__(cls)
                cls._instance._connection: Optional[pika.BlockingConnection] = None
                cls._instance._channel: Optional[pika.channel.Channel] = None
                cls._instance._last_connection_attempt: float = 0
        return cls._instance

    def get_channel(self) -> pika.channel.Channel:
        """
        RabbitMQ 채널을 가져오거나 생성합니다.

        연결이 없거나 닫혀있는 경우 새로운 연결을 생성합니다.

        Returns:
            pika.channel.Channel: RabbitMQ 채널 객체.

        Raises:
            RabbitMQConnectionError: 최대 재시도 횟수 후 연결 실패 시 발생.
        """
        if not self.check_connection():
            self._connect()
        return self._channel

    def _connect(self) -> None:
        """
        RabbitMQ에 연결하고 채널을 생성합니다.

        연결 실패 시 지수 백오프를 사용하여 재시도합니다.

        Raises:
            RabbitMQConnectionError: 최대 재시도 횟수 후 연결 실패 시 발생.
        """
        retry_count = 0
        max_retries = 5
        while retry_count < max_retries:
            try:
                current_time = time.time()
                if current_time - self._last_connection_attempt < 60:  # 1분 내에 재시도하지 않음
                    time.sleep(60 - (current_time - self._last_connection_attempt))
                
                self._last_connection_attempt = time.time()
                self._connection = pika.BlockingConnection(
                    pika.ConnectionParameters(
                        host=config.RABBITMQ_HOST,
                        port=config.RABBITMQ_PORT,
                        heartbeat=600,
                        blocked_connection_timeout=300,
                        connection_attempts=3,
                        retry_delay=5,
                    )
                )
                self._channel = self._connection.channel()
                self._channel.queue_declare(
                    queue=config.RABBITMQ_QUEUE, durable=True
                )
                self._channel.exchange_declare(
                    exchange=RABBITMQ_RESPONSE_EXCHANGE,
                    exchange_type='fanout',
                    durable=True
                )
                self._channel.queue_declare(
                    queue=config.RABBITMQ_RESPONSE_QUEUE, durable=True
                )
                self._channel.queue_bind(
                    exchange=RABBITMQ_RESPONSE_EXCHANGE,
                    queue=config.RABBITMQ_RESPONSE_QUEUE
                )
                
                # TRAIN_QUEUE 설정
                self._channel.exchange_declare(
                    exchange=TRAIN_EXCHANGE,
                    exchange_type='fanout',
                    durable=True
                )
                self._channel.queue_declare(
                    queue=TRAIN_QUEUE, durable=True
                )
                self._channel.queue_bind(
                    exchange=TRAIN_EXCHANGE,
                    queue=TRAIN_QUEUE
                )

                # PROGRESS_QUEUE 설정
                self._channel.exchange_declare(
                    exchange=PROGRESS_EXCHANGE,
                    exchange_type='fanout',
                    durable=True
                )
                self._channel.queue_declare(
                    queue=PROGRESS_QUEUE, durable=True
                )
                self._channel.queue_bind(
                    exchange=PROGRESS_EXCHANGE,
                    queue=PROGRESS_QUEUE
                )
                
                logger.info("RabbitMQ 연결 및 exchange 설정 성공 (TRAIN_QUEUE 및 PROGRESS_QUEUE 포함)")
                return
            except AMQPConnectionError as e:
                retry_count += 1
                wait_time = min(60, 5 * (2 ** retry_count))  # 지수 백오프 적용, 최대 1분
                logger.warning(f"RabbitMQ 연결 실패. {wait_time}초 후 재시도... (시도 {retry_count}/{max_retries}): {e}")
                time.sleep(wait_time)
        
        logger.error(f"RabbitMQ 연결 실패: 최대 재시도 횟수 ({max_retries})를 초과했습니다.")
        raise RabbitMQConnectionError("최대 재시도 횟수를 초과했습니다.")

    def check_connection(self) -> bool:
        """
        연결 상태를 확인하고 필요한 경우 재연결합니다.

        Returns:
            bool: 연결이 활성 상태이면 True, 그렇지 않으면 False
        """
        if self._connection is None or self._connection.is_closed:
            logger.info("RabbitMQ 연결이 닫혀있거나 없습니다. 재연결을 시도합니다.")
            try:
                self._connect()
                return True
            except RabbitMQConnectionError:
                logger.error("RabbitMQ 재연결 실패")
                return False
        return True

    def close(self) -> None:
        """
        RabbitMQ 연결을 안전하게 종료합니다.
        """
        if self._connection and self._connection.is_open:
            logger.info("RabbitMQ 연결을 종료합니다.")
            self._connection.close()

class RabbitMQHandler:
    """
    RabbitMQ 작업을 처리하는 핸들러 클래스.

    이 클래스는 RabbitMQ 메시지 송수신 및 처리와 관련된 정적 메서드를 제공합니다.
    """

    @staticmethod
    def send_response_to_queue(correlation_id: str, response_data: Dict[str, Any]) -> None:
        """
        RabbitMQ 큐에 응답을 전송합니다.

        Args:
            correlation_id (str): 메시지의 상관 ID.
            response_data (Dict[str, Any]): 전송할 응답 데이터.

        Raises:
            RabbitMQConnectionError: 메시지 전송 중 오류 발생 시.

        Note:
            이 메서드는 지수 백오프를 사용하여 메시지 전송을 재시도합니다.
        """
        connection = RabbitMQConnection()
        retry_count = 0
        max_retries = 3
        while retry_count < max_retries:
            try:
                channel = connection.get_channel()
                message = json.dumps(response_data)
                channel.basic_publish(
                    exchange='',
                    routing_key=config.RABBITMQ_RESPONSE_QUEUE,
                    body=message,
                    properties=pika.BasicProperties(
                        delivery_mode=2, correlation_id=correlation_id
                    ),
                )
                logger.info(f"{config.RABBITMQ_RESPONSE_QUEUE}에 응답 전송 완료. 상관 ID: {correlation_id}")
                return
            except AMQPError as e:
                retry_count += 1
                wait_time = min(30, 5 * (2 ** retry_count))  # 지수 백오프 적용, 최대 30초
                logger.warning(f"RabbitMQ에 메시지 전송 실패 (시도 {retry_count}/{max_retries}): {e}")
                time.sleep(wait_time)
        
        logger.error(f"RabbitMQ에 메시지 전송 실패: 최대 재시도 횟수 ({max_retries})를 초과했습니다.")
        raise RabbitMQConnectionError("메시지 전송 중 오류가 발생했습니다.")

    def __init__(self):
        self.data_processor = DataProcessor()

    def process_data_wrapper(self, ch: pika.channel.Channel, method: pika.spec.Basic.Deliver, 
                             properties: pika.spec.BasicProperties, body: bytes) -> None:
        self._process_message(ch, method, properties, body, Operation.CLASSIFY)

    def process_train_wrapper(self, ch: pika.channel.Channel, method: pika.spec.Basic.Deliver, 
                              properties: pika.spec.BasicProperties, body: bytes) -> None:
        try:
            logger.info(f"{Operation.TRAIN} 메시지 수신")
            message = self._parse_message(body)
            workspace_id = message.get("workspaceId")
            requester_id = message.get("requesterId")

            if workspace_id is None or requester_id is None:
                raise MessageProcessingError("workspaceId 또는 requesterId가 제공되지 않았습니다.")

            # 작업 공간 이미지 정리
            ImageService.organize_workspace_images(workspace_id)

            # YOLO 모델 훈련 로직
            yolo_service = YOLOService()
            epochs = message.get("epochs", 10)  # 기본값 10
            imgsz = message.get("imgsz", 416)   # 기본값 416

            def progress_callback(progress):
                progress_message = {
                    "workspaceId": workspace_id,
                    "requesterId": requester_id,
                    "progress": progress
                }
                SSEManager.send_event(requester_id, 'train_progress', json.dumps(progress_message))

            results = yolo_service.train(workspace_id, epochs=epochs, imgsz=imgsz, progress_callback=progress_callback)

            response = self._create_train_response(message, results)
            self.send_response_to_queue(properties.correlation_id, response)
            ch.basic_ack(delivery_tag=method.delivery_tag)

        except json.JSONDecodeError as e:
            logger.error(f"JSON 디코딩 오류: {e}")
            self._send_error_response(properties.correlation_id, "JSON_DECODE_ERROR", str(e))
            ch.basic_ack(delivery_tag=method.delivery_tag)
        except MessageProcessingError as e:
            logger.error(f"메시지 처리 오류: {e}")
            self._send_error_response(properties.correlation_id, "MESSAGE_PROCESSING_ERROR", str(e))
            ch.basic_ack(delivery_tag=method.delivery_tag)
        except Exception as e:
            logger.error(f"예기치 않은 오류 발생: {e}")
            self._send_error_response(properties.correlation_id, "UNEXPECTED_ERROR", str(e))
            ch.basic_ack(delivery_tag=method.delivery_tag)

    def process_export_wrapper(self, ch: pika.channel.Channel, method: pika.spec.Basic.Deliver, 
                               properties: pika.spec.BasicProperties, body: bytes) -> None:
        try:
            logger.info(f"{Operation.EXPORT} 메시지 수신")
            message = self._parse_message(body)
            workspace_id = message.get("workspaceId")
            requester_id = message.get("requesterId")
            version = message.get("version")
            export_format = message.get("format", "onnx")

            if workspace_id is None or requester_id is None:
                raise MessageProcessingError("workspaceId 또는 requesterId가 제공되지 않았습니다.")

            yolo_service = YOLOService()
            exported_path = yolo_service.export_model(workspace_id, version, export_format)

            response = {
                "requesterId": requester_id,
                "workspaceId": workspace_id,
                "exportedPath": exported_path,
                "format": export_format
            }
            self.send_response_to_queue(properties.correlation_id, response)
            ch.basic_ack(delivery_tag=method.delivery_tag)

            # SSE를 통해 내보내기 완료 알림 전송
            SSEManager.send_event(requester_id, 'export_complete', json.dumps(response))

        except json.JSONDecodeError as e:
            logger.error(f"JSON 디코딩 오류: {e}")
            self._send_error_response(properties.correlation_id, "JSON_DECODE_ERROR", str(e))
            ch.basic_ack(delivery_tag=method.delivery_tag)
        except MessageProcessingError as e:
            logger.error(f"메시지 처리 오류: {e}")
            self._send_error_response(properties.correlation_id, "MESSAGE_PROCESSING_ERROR", str(e))
            ch.basic_ack(delivery_tag=method.delivery_tag)
        except ValueError as e:
            logger.error(f"값 오류: {e}")
            self._send_error_response(properties.correlation_id, "VALUE_ERROR", str(e))
            ch.basic_ack(delivery_tag=method.delivery_tag)
        except Exception as e:
            logger.error(f"예기치 않은 오류 발생: {e}")
            self._send_error_response(properties.correlation_id, "UNEXPECTED_ERROR", str(e))
            ch.basic_ack(delivery_tag=method.delivery_tag)

    def _process_message(self, ch: pika.channel.Channel, method: pika.spec.Basic.Deliver, 
                         properties: pika.spec.BasicProperties, body: bytes, operation: Operation) -> None:
        """
        수신되는 RabbitMQ 메시지를 처리하는 래퍼 메서드.

        이 메서드는 메시지를 파싱하고, 데이터 처리를 수행한 후 결과를 응답 큐에 전송합니다.

        Args:
            ch (pika.channel.Channel): 채널 객체.
            method (pika.spec.Basic.Deliver): 메서드 프레임.
            properties (pika.spec.BasicProperties): 메시지의 속성.
            body (bytes): 메시지 본문.
            operation (Operation): 수행할 작업 유형 (Operation.CLASSIFY 또는 Operation.TRAIN)

        Note:
            이 메서드는 다양한 예외 상황을 처리하며, 오류 발생 시 적절한 로깅을 수행합니다.
        """
        try:
            logger.info(f"{operation} 메시지 수신")
            message = self._parse_message(body)
            dummy_request = self._create_dummy_request(message)

            result = self.data_processor.process_data(dummy_request, operation)
            
            if operation == Operation.CLASSIFY:
                response = self._create_response(message, result)
            else:  # Operation.TRAIN
                response = self._create_train_response(message, result)

            self.send_response_to_queue(properties.correlation_id, response)
            ch.basic_ack(delivery_tag=method.delivery_tag)

        except StreamLostError:
            logger.error("연결이 끊겼습니다. 재연결을 시도합니다...")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)
        except json.JSONDecodeError as e:
            logger.error(f"JSON 디코딩 오류: {e}")
            ch.basic_ack(delivery_tag=method.delivery_tag)  # 잘못된 메시지는 버림
        except MessageProcessingError as e:
            logger.error(f"메시지 처리 오류: {e}")
            ch.basic_ack(delivery_tag=method.delivery_tag)  # 처리할 수 없는 메시지는 버림
        except Exception as e:
            logger.error(f"예기치 않은 오류 발생: {e}")
            ch.basic_ack(delivery_tag=method.delivery_tag)  # 오류 발생 시 메시지 버림

    @staticmethod
    def _parse_message(body: bytes) -> Dict[str, Any]:
        """
        메시지 본문을 파싱합니다.

        Args:
            body (bytes): 파싱할 메시지 본문.

        Returns:
            Dict[str, Any]: 파싱된 메시지 데이터.

        Raises:
            MessageProcessingError: JSON 파싱 오류 발생 시.
        """
        try:
            return json.loads(json.loads(body.decode("utf-8")))
        except json.JSONDecodeError as e:
            raise MessageProcessingError(f"메시지 파싱 오류: {e}")

    @staticmethod
    def _create_dummy_request(message: Dict[str, Any]):
        """
        더미 요청 객체를 생성합니다.

        Args:
            message (Dict[str, Any]): 원본 메시지 데이터.

        Returns:
            DummyRequest: 생성된 더미 요청 객체.
        """
        class DummyRequest:
            def __init__(self, json_data: Dict[str, Any]):
                self.json = json_data
                self.headers = {"x-api-key": config.API_KEY}
        return DummyRequest(message)

    @staticmethod
    def _create_response(message: Dict[str, Any], labels_and_ids: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        분류 응답 데이터를 생성합니다.

        Args:
            message (Dict[str, Any]): 원본 메시지 데이터.
            labels_and_ids (List[Dict[str, Any]]): 분류 결과 데이터.

        Returns:
            Dict[str, Any]: 생성된 응답 데이터.
        """
        return {
            "requesterId": message.get("requesterId"),
            "workspaceId": message.get("workspaceId"),
            "labelsAndIds": labels_and_ids,
        }

    @staticmethod
    def _create_train_response(message: Dict[str, Any], train_result: Any) -> Dict[str, Any]:
        """
        훈련 응답 데이터를 생성합니다.

        Args:
            message (Dict[str, Any]): 원본 메시지 데이터.
            train_result (Any): 훈련 결과 데이터.

        Returns:
            Dict[str, Any]: 생성된 응답 데이터.
        """
        return {
            "requesterId": message.get("requesterId"),
            "workspaceId": message.get("workspaceId"),
            "trainResult": train_result,
        }

    def _send_error_response(self, correlation_id: str, error_code: str, error_message: str) -> None:
        """
        오류 응답을 RabbitMQ 큐로 전송합니다.

        Args:
            correlation_id (str): 메시지의 상관 ID.
            error_code (str): 오류 코드.
            error_message (str): 오류 메시지.
        """
        error_response = {
            "error": {
                "code": error_code,
                "message": error_message
            }
        }
        self.send_response_to_queue(correlation_id, error_response)
