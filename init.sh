#!/bin/bash

if [ $(docker network ls | grep shared-net | wc -l) -eq 0 ]; then
  docker network create shared-net
else
  echo "Network shared-net already exists"
fi

cd docker-env

docker compose up -d