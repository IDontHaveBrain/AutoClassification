# AutoClassification

이 프로젝트는 OpenAI API와 YOLOv8을 활용하여 CustomDataSet으로 Classification 모델의 자동 라벨링 및 훈련을 수행합니다.

## AiServer

AiServer는 이 멀티모듈 프로젝트의 핵심 컴포넌트로, 이미지 분류 및 모델 훈련을 담당합니다.

### 주요 기능

- OpenAI의 GPT-4 Vision을 사용한 자동 이미지 분류
- 커스텀 데이터셋 생성 및 관리
- 특정 분류 작업을 위한 YOLOv8 모델 훈련
- 분류 및 훈련 작업을 위한 RESTful API
- 비동기 처리를 위한 RabbitMQ 통합
- 동시 처리 및 개선된 오류 처리로 성능 최적화
- 디버깅 및 모니터링을 위한 구조화된 로깅 시스템

### 시작하기

#### 전제 조건

- Python 3.11+
- Docker (선택사항)
- RabbitMQ 서버

#### 설치

1. 저장소 클론:
   ```
   git clone https://github.com/yourusername/AutoClassification.git
   cd AutoClassification
   ```

2. 의존성 설치:
   ```
   pip install -r AiServer/requirements.txt
   ```

3. 환경 변수 설정:
   - `.env.example`을 `.env`로 복사
   - 필요한 변수 입력 (자세한 내용은 `config.py` 참조)

#### 애플리케이션 실행

1. Flask 서버 시작:
   ```
   python AiServer/app.py
   ```

2. (선택사항) Docker로 실행:
   ```
   docker-compose up --build AiServer
   ```

### API 엔드포인트

- `/api/classify`: POST - 이미지 분류
- `/api/testclassify`: POST - 결과 저장 없이 분류 테스트
- `/api/train`: POST - 작업 공간에서 모델 훈련
- `/health`: GET - 헬스 체크

### 프로젝트 구조

- `AiServer/`: 메인 애플리케이션 디렉토리
  - `api/`: API 라우트 및 오류 핸들러
  - `services/`: 비즈니스 로직 및 데이터 처리
  - `models/`: 데이터 모델
  - `utils/`: 유틸리티 함수 및 헬퍼
  - `exceptions/`: 커스텀 예외 클래스
  - `tests/`: 단위 및 통합 테스트 (진행 중)
  - `config.py`: 설정 관리

### 성능 최적화

애플리케이션은 다음과 같이 성능이 최적화되었습니다:
- 병렬 처리 증가로 이미지 청크의 동시 처리
- 재시도 및 오류 복구를 통한 RabbitMQ 연결 처리 개선
- 향상된 동시성으로 비동기 이미지 처리 및 분류
- API 요청을 위한 이미지 크기 조정 최적화
- 스트리밍 응답을 통한 효율적인 메모리 사용

### 테스트

테스트 환경 접속: [https://toy.dev.nobrain.cc/sign-in](https://toy.dev.nobrain.cc/sign-in)

테스트 계정:
- 사용자 이름: test@test.com
- 비밀번호: 123123!

단위 테스트 실행:
```
python -m unittest discover AiServer/tests
```

현재 테스트 스위트에 포함된 항목:
- ClassificationService 단위 테스트
- ImageService 단위 테스트
- DataProcessor 단위 테스트
- API 엔드포인트 통합 테스트 (진행 중)

애플리케이션의 신뢰성과 안정성을 보장하기 위해 테스트 범위를 지속적으로 개선하고 있습니다.

### 문제 해결

문제가 발생하면 다음 사항을 확인하세요:
- 모든 환경 변수가 올바르게 설정되었는지 확인
- RabbitMQ 서버가 실행 중이고 접근 가능한지 확인
- OpenAI API 키가 유효하고 충분한 크레딧이 있는지 확인
- Docker 사용자의 경우 Docker 데몬이 실행 중인지 확인

더 자세한 로그를 보려면 설정에서 로그 레벨을 DEBUG로 설정하세요.

## 기타 모듈

이 프로젝트는 AiServer 외에도 프론트엔드와 백엔드 모듈을 포함하고 있습니다. 각 모듈에 대한 자세한 정보는 해당 디렉토리의 README 파일을 참조하세요.
