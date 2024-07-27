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
                    queue=config.RABBITMQ_RESPONSE_QUEUE, durable=True
                )
                logger.info("RabbitMQ 연결 성공")
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
                    exchange="",
                    routing_key=config.RABBITMQ_RESPONSE_QUEUE,
                    body=message,
                    properties=pika.BasicProperties(
                        delivery_mode=2, correlation_id=correlation_id
                    ),
                )
                logger.info(f"ClassifyResponseQueue에 응답 전송 완료. 상관 ID: {correlation_id}")
                return
            except AMQPError as e:
                retry_count += 1
                wait_time = min(30, 5 * (2 ** retry_count))  # 지수 백오프 적용, 최대 30초
                logger.warning(f"RabbitMQ에 메시지 전송 실패 (시도 {retry_count}/{max_retries}): {e}")
                time.sleep(wait_time)
        
        logger.error(f"RabbitMQ에 메시지 전송 실패: 최대 재시도 횟수 ({max_retries})를 초과했습니다.")
        raise RabbitMQConnectionError("메시지 전송 중 오류가 발생했습니다.")

    @staticmethod
    def process_data_wrapper(ch: pika.channel.Channel, method: pika.spec.Basic.Deliver, 
                             properties: pika.spec.BasicProperties, body: bytes) -> None:
        """
        수신되는 RabbitMQ 메시지를 처리하는 래퍼 메서드.

        이 메서드는 메시지를 파싱하고, 데이터 처리를 수행한 후 결과를 응답 큐에 전송합니다.

        Args:
            ch (pika.channel.Channel): 채널 객체.
            method (pika.spec.Basic.Deliver): 메서드 프레임.
            properties (pika.spec.BasicProperties): 메시지의 속성.
            body (bytes): 메시지 본문.

        Note:
            이 메서드는 다양한 예외 상황을 처리하며, 오류 발생 시 적절한 로깅을 수행합니다.
        """
        try:
            logger.info("메시지 수신")
            message = RabbitMQHandler._parse_message(body)
            dummy_request = RabbitMQHandler._create_dummy_request(message)
            
            operation = "auto"
            labels_and_ids = DataProcessor.process_data(dummy_request, operation)
            result = RabbitMQHandler._create_response(message, labels_and_ids)

            RabbitMQHandler.send_response_to_queue(properties.correlation_id, result)
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
        응답 데이터를 생성합니다.

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
