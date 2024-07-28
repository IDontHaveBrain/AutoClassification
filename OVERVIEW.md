# 프로젝트 개요

## 주요 구성 요소
- 실시간 통신을 위한 서버-사이드 이벤트 (SSE)
- 사용자 인증 및 권한 부여
- 워크스페이스 관리
- 알림 시스템
- 그룹 기반 메시징
- 공통 테이블 컴포넌트 (BaseTable)

## 기술 스택
- 프론트엔드: React, TypeScript
- 백엔드: Kotlin, Spring Boot
- 데이터베이스: PostgreSQL
- 실시간 통신: Server-Sent Events (SSE)
- UI 라이브러리: Material-UI

## 주요 기능
- 사용자 관리 및 인증
- 실시간 알림 및 메시지 전송
- 워크스페이스 생성 및 관리
- 파일 업로드 및 관리
- 그룹 기반 메시지 전송
- 서버 측 페이지네이션 및 정렬

## 코딩 규칙
- 함수 및 변수명은 카멜케이스(camelCase)를 사용해야 함
- SSE 관련 코드는 모듈화하여 SseManager 클래스에서 관리
- 서버 측 SSE 로직은 SseHandler 클래스에서 처리
- 주석은 항상 한글로 작성해야 함
- SSE 연결은 BackGround.tsx에서 중앙 관리
- 컴포넌트 간 SSE 이벤트 통신은 이벤트 버스를 사용
- 그룹 기반 메시징은 SseHandler와 SseService에서 처리
- 알람 관련 로직은 AlarmServiceImpl에서 SseService를 사용하여 처리
- 가능한 한 타입 안전(Type-safe)하게 코드를 작성해야 함
- BaseTable 컴포넌트 사용 시 서버 측 페이지네이션 및 정렬 로직을 일관되게 적용해야 함
- 성능 최적화를 위해 useCallback, useMemo 등의 React 훅을 적절히 사용해야 함
- 프론트엔드에서는 가능한 한 화살표 함수를 사용하여 일관성 있고 현대적인 코드 스타일을 유지해야 함
- 리스트 컴포넌트에서는 고급 검색 옵션을 제공하여 사용자 경험을 향상시켜야 함
- 툴팁과 확장 가능한 행 기능을 활용하여 데이터의 가독성과 접근성을 개선해야 함
