#!/bin/bash

if [ $(docker network ls | grep share-net | wc -l) -eq 0 ]; then
  docker network create share-net
else
  echo "Network share-net already exists"
fi

cd env-classfiy

docker compose up -d