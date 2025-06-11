#!/bin/bash

APP_NAME="elevation-health-api"
VERSION="1.0.3"
IMAGE_NAME="${APP_NAME}:${VERSION}"
TAR_FILE="${APP_NAME}-${VERSION}.tar"
DEPLOY_DIR="deployment-package"

echo "🧹 Cleaning up old Docker resources..."
docker system prune -f
docker rmi ${IMAGE_NAME} 2>/dev/null || true

echo "🏗️  Starting Docker build..."
start_time=$(date +%s)

DOCKER_BUILDKIT=1 docker build --compress -f Dockerfile.dev -t ${IMAGE_NAME} .

end_build_time=$(date +%s)
build_duration=$((end_build_time - start_time))
echo "✅ Docker build completed in ${build_duration} seconds."

# Save tar outside context
mkdir -p deployment-package

echo "📦 Saving Docker image to tar file..."
docker save -o deployment-package/${TAR_FILE} ${IMAGE_NAME}

end_save_time=$(date +%s)
save_duration=$((end_save_time - end_build_time))
total_duration=$((end_save_time - start_time))

echo "📝 Docker image saved in ${save_duration} seconds."
echo "⏱️  Total process completed in ${total_duration} seconds."
