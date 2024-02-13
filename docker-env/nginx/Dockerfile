FROM nginx:stable-alpine
LABEL authors="nj.jo"

RUN rm /etc/nginx/conf.d/*

COPY *.conf /etc/nginx/conf.d/

EXPOSE 8087