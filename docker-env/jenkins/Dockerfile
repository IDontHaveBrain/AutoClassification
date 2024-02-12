FROM jenkins/jenkins:jdk21
LABEL authors="nj.jo"

USER root
RUN apt-get update &&\
    apt-get upgrade -y &&\
    apt-get install -y openssh-client git

RUN mkdir -p /app/jenkins/casc_configs/
COPY plugins.txt /usr/share/jenkins/ref/plugins.txt
COPY jenkins.yaml /app/jenkins/casc_configs/jenkins.yaml
COPY Jenkinsfile /app/jenkins/casc_configs/Jenkinsfile
COPY generate-ssh-keys.sh /generate-ssh-keys.sh
COPY init.sh /init.sh

RUN curl -L https://github.com/jenkinsci/plugin-installation-manager-tool/releases/download/2.12.15/jenkins-plugin-manager-2.12.15.jar -o /opt/jenkins-plugin-manager.jar
RUN java -jar /opt/jenkins-plugin-manager.jar --war /usr/share/jenkins/jenkins.war --plugin-file /usr/share/jenkins/ref/plugins.txt

RUN chmod +x /generate-ssh-keys.sh
RUN chmod +x /init.sh
RUN /init.sh
