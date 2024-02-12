FROM nobrain/base
LABEL authors="nj.jo"

# 포트번호 설정
EXPOSE 8080

# 빌드 파일 복사
ARG JAR_FILE=build/libs/*.jar
COPY ${JAR_FILE} user-server.jar

# 실행
ENTRYPOINT ["java", "-jar", "-Djava.awt.headless=true", "/user-server.jar"]
#ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=dev", "-Djava.awt.headless=true", "/user-server.jar"]