FROM nobrain/base
LABEL authors="nj.jo"

EXPOSE 8080

ARG JAR_FILE=build/libs/*.jar
COPY ${JAR_FILE} user-server.jar

# 파일 업로드 및 임시 파일 저장을 위한 디렉토리 생성
RUN mkdir -p /data/docker/toy/
VOLUME /data/docker/toy
RUN chmod -R 777 /data/docker/toy/

# 개발 프로파일로 Spring Boot 애플리케이션 실행
ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=dev", "-Djava.awt.headless=true", "/user-server.jar"]