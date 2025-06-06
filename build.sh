#!/bin/bash

APP_NAME="elevation-health-api"
VERSION="1.0.0"
IMAGE_NAME="${APP_NAME}:${VERSION}"
TAR_FILE="${APP_NAME}-${VERSION}.tar"
DEPLOY_DIR="deployment-package"

docker system prune -f
docker rmi ${IMAGE_NAME} 2>/dev/null || true

DOCKER_BUILDKIT=1 docker build --compress -f Dockerfile -t ${IMAGE_NAME} .

docker save -o ${TAR_FILE} ${IMAGE_NAME}
