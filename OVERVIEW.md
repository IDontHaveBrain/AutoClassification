# 프로젝트 개요

## 주요 구성 요소
- 실시간 통신을 위한 서버-사이드 이벤트 (SSE)
- 사용자 인증 및 권한 부여
- 워크스페이스 관리
- 알림 시스템
- 그룹 기반 메시징

## 기술 스택
- 프론트엔드: React, TypeScript
- 백엔드: Kotlin, Spring Boot
- 데이터베이스: PostgreSQL
- 실시간 통신: Server-Sent Events (SSE)

## 주요 기능
- 사용자 관리 및 인증
- 실시간 알림 및 메시지 전송
- 워크스페이스 생성 및 관리
- 파일 업로드 및 관리
- 그룹 기반 메시지 전송

## SSE 연결 개선 사항
- 주기적인 Heartbeat 폴링 제거
- 연결 상태 모니터링 개선
- 적응형 재연결 전략 구현
- 메시지 큐잉 및 재전송 기능 추가
- SSE 연결 관리 중앙화 (BackGround.tsx)
- 이벤트 버스 시스템을 통한 컴포넌트 간 통신
- 그룹 기반 메시징 지원
- NotificationComponent 제거 및 AlarmServiceImpl에서 SseService 사용

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
