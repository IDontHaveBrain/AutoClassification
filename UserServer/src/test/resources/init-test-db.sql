-- DockerIntegrationTest용 테스트 데이터베이스 초기화
-- 이 스크립트는 PostgreSQL TestContainer 시작 시 실행됩니다

-- 필수 확장 기능 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 필요시 추가 테스트 전용 설정 생성
-- 실제 스키마는 Hibernate의 ddl-auto: create-drop으로 생성됩니다

-- 일관된 테스트를 위한 시간대 설정
SET timezone = 'UTC';

-- 초기화 로그
SELECT '테스트 데이터베이스가 성공적으로 초기화되었습니다' AS status;