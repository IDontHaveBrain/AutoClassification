# AutoClassification

이 프로젝트는 OpenAI API와 YOLOv8을 활용하여 CustomDataSet으로 Classification 모델의 자동 라벨링 및 훈련을 수행합니다.

## AiServer

<details>
<summary>AiServer는 이 멀티모듈 프로젝트의 핵심 컴포넌트로, 이미지 분류 및 모델 훈련을 담당합니다.</summary>

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

### 문제 해결

문제가 발생하면 다음 사항을 확인하세요:
- 모든 환경 변수가 올바르게 설정되었는지 확인
- RabbitMQ 서버가 실행 중이고 접근 가능한지 확인
- OpenAI API 키가 유효하고 충분한 크레딧이 있는지 확인
- Docker 사용자의 경우 Docker 데몬이 실행 중인지 확인

더 자세한 로그를 보려면 설정에서 로그 레벨을 DEBUG로 설정하세요.

</details>

## UserServer

<details>
<summary>UserServer는 이 멀티모듈 프로젝트의 핵심 컴포넌트로, 사용자 관리 및 인증을 담당합니다.</summary>

### 주요 기능

- 사용자 등록, 인증 및 권한 관리
- OAuth2 및 JWT 기반의 보안 시스템
- 워크스페이스 관리 및 협업 기능
- 실시간 알림 시스템 (SSE 활용)
- 파일 업로드 및 관리
- 머신러닝 관련 작업 요청 및 결과 처리

### 기술 스택

- 언어: Kotlin
- 프레임워크: Spring Boot 3.2.8
- 데이터베이스: PostgreSQL
- ORM: Spring Data JPA
- 캐싱: Redis
- 메시징: RabbitMQ
- 보안: Spring Security, OAuth2, JWT
- API 문서화: Swagger (SpringDoc)

### 시작하기

#### 전제 조건

- JDK 21+
- Docker (선택사항)
- PostgreSQL 데이터베이스
- Redis 서버
- RabbitMQ 서버

#### 설치 및 실행

1. 저장소 클론:
   ```
   git clone https://github.com/yourusername/AutoClassification.git
   cd AutoClassification/UserServer
   ```

2. 환경 변수 설정:
   - `application.yml` 파일에서 필요한 설정 수정 (데이터베이스 연결 정보 등)

3. 애플리케이션 빌드 및 실행:
   ```
   ./gradlew bootRun
   ```

4. (선택사항) Docker로 실행:
   ```
   docker-compose up --build UserServer
   ```

### 주요 API 엔드포인트

- `/api/member`: 사용자 관리 관련 API
- `/api/workspace`: 워크스페이스 관리 API
- `/api/train`: 머신러닝 훈련 데이터 관리 API
- `/api/alarm`: 알림 관리 API
- `/api/sse`: 서버-센트 이벤트(SSE) 관련 API
- `/auth`: 인증 관련 API

### 프로젝트 구조

- `src/main/kotlin/cc/nobrain/dev/userserver/`
  - `common/`: 공통 유틸리티 및 설정
  - `config/`: 애플리케이션 설정
  - `domain/`: 도메인별 로직 및 엔티티
  - `security/`: 보안 관련 설정 및 구현

### 보안 및 인증

- Spring Security를 이용한 인증 및 인가
- OAuth2 및 JWT 기반의 토큰 인증 시스템
- 비밀번호 암호화에 BCrypt 알고리즘 사용

### 성능 최적화

- Redis를 이용한 캐싱 구현
- 데이터베이스 인덱싱 및 쿼리 최적화
- 비동기 처리를 위한 코루틴 사용

### 문제 해결

문제가 발생하면 다음 사항을 확인하세요:
- 모든 환경 변수가 올바르게 설정되었는지 확인
- 데이터베이스, Redis, RabbitMQ 서버가 실행 중이고 접근 가능한지 확인
- 로그 파일을 확인하여 상세한 오류 메시지 확인

더 자세한 로그를 보려면 `application.yml`에서 로그 레벨을 DEBUG로 설정하세요.

</details>

## 프론트엔드

<details>
<summary>프론트엔드는 이 멀티모듈 프로젝트의 사용자 인터페이스를 담당하며, React와 TypeScript를 기반으로 구축되었습니다.</summary>

### 주요 기능

- 사용자 관리 (회원가입, 로그인, 프로필 관리)
- 워크스페이스 관리 (생성, 조회, 수정, 삭제, 멤버 초대)
- 실시간 알림 시스템 (Server-Sent Events 사용)
- 파일 관리 (이미지 업로드 및 관리)
- 머신러닝 통합 (이미지 분류 및 자동 라벨링 인터페이스)
- 테스트 분류 (테스트 이미지 업로드 및 분류)

### 기술 스택

- 언어: TypeScript
- 프레임워크: React
- 상태 관리: Redux (Redux Toolkit)
- UI 라이브러리: Material-UI (MUI)
- 라우팅: React Router
- HTTP 클라이언트: Axios
- 빌드 도구: Create React App
- 패키지 관리자: Yarn

### 시작하기

#### 전제 조건

- Node.js 20+
- Yarn

#### 설치 및 실행

1. 저장소 클론:
   ```
   git clone https://github.com/yourusername/AutoClassification.git
   cd AutoClassification/front
   ```

2. 의존성 설치:
   ```
   yarn install
   ```

3. 개발 서버 실행:
   ```
   yarn start
   ```

4. 프로덕션 빌드:
   ```
   yarn build
   ```

### 주요 구조

- `src/`: 소스 코드 디렉토리
  - `components/`: 재사용 가능한 React 컴포넌트
  - `pages/`: 페이지 레벨 컴포넌트
  - `layouts/`: 레이아웃 컴포넌트 (예: TopBar, LeftBar)
  - `stores/`: Redux 스토어 설정 및 슬라이스
  - `services/`: API 서비스 및 기타 유틸리티
  - `utils/`: 유틸리티 함수 및 상수
  - `models/`: TypeScript 인터페이스 및 타입

### 상태 관리

- Redux를 사용한 전역 상태 관리
- Redux Toolkit을 활용한 효율적인 Redux 개발
- redux-persist를 사용한 상태 유지

### 라우팅

- React Router를 사용한 클라이언트 사이드 라우팅
- `src/Routers.tsx`에 라우트 정의

### API 통합

- Axios를 사용한 백엔드 HTTP 요청
- API 서비스는 `src/service/Apis/` 디렉토리에 구성

### 인증

- JWT 기반 인증
- 인증 상태는 Redux에서 관리되며 세션 스토리지에 유지

### 개발 및 빌드 프로세스

- 개발 서버: `yarn start`
- 프로덕션 빌드: `yarn build`
- 린팅: ESLint with 커스텀 설정

### 배포

- Docker를 사용한 애플리케이션 컨테이너화
- Jenkins를 통한 CI/CD (`Jenkinsfile`에 구성)

</details>

## 테스트
<details>

테스트 환경 접속: [http://toy.dev.nobrain.cc/sign-in](http://toy.dev.nobrain.cc/sign-in)

테스트 계정:
- 사용자 이름: test@test.com
- 비밀번호: 123123!

</details>
