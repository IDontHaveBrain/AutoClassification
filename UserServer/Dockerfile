FROM nobrain/base
LABEL authors="nj.jo"

EXPOSE 8080

ARG JAR_FILE=build/libs/*.jar
COPY ${JAR_FILE} user-server.jar

RUN mkdir -p /data/docker/toy/
VOLUME /data/docker/toy
RUN chmod -R 777 /data/docker/toy/

ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=dev", "-Djava.awt.headless=true", "/user-server.jar"]