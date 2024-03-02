FROM jenkins/jenkins:jdk17
LABEL authors="nj.jo"

USER root

RUN mkdir -p /app/jenkins/casc_configs/
COPY plugins.txt /usr/share/jenkins/ref/plugins.txt
COPY jenkins.yaml /app/jenkins/casc_configs/jenkins.yaml
COPY generate-ssh-keys.sh /generate-ssh-keys.sh
COPY init.sh /init.sh

#RUN curl -L https://github.com/jenkinsci/plugin-installation-manager-tool/releases/download/2.12.15/jenkins-plugin-manager-2.12.15.jar -o /opt/jenkins-plugin-manager.jar
#RUN java -jar /opt/jenkins-plugin-manager.jar --war /usr/share/jenkins/jenkins.war --plugin-file /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt

RUN chmod +x /generate-ssh-keys.sh
RUN chmod +x /init.sh
#RUN /init.sh

#Docker Cli for Jenkins
RUN apt-get update &&\
    apt-get -y install ca-certificates curl &&\
    install -m 0755 -d /etc/apt/keyrings &&\
    curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc &&\
    chmod a+r /etc/apt/keyrings/docker.asc

RUN echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null
RUN apt-get update
RUN apt-get -y install docker-ce-cli

ENV SLACK_TOKEN zmFB92Yrhj0tEZVSwP1daQoa
USER jenkins
ENV SLACK_TOKEN zmFB92Yrhj0tEZVSwP1daQoa