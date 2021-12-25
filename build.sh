#!/bin/bash

docker build -t permafrostsoftware/prettier-docker-ga .

if [ "$1" == "--push" ]; then
    docker push permafrostsoftware/prettier-docker-ga:latest
fi