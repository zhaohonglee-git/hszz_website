#!/bin/bash
# 通过代理拉取 node:22-alpine，依次尝试直到成功
IMAGE="node:22-alpine"
PROXIES=(
  "docker.1ms.run/library"
  "docker.m.daocloud.io/library"
  "dockerhub.icu/library"
  "dockerpull.com/library"
)
for proxy in "${PROXIES[@]}"; do
  echo "尝试: ${proxy}/${IMAGE} ..."
  if docker pull "${proxy}/${IMAGE}"; then
    docker tag "${proxy}/${IMAGE}" "${IMAGE}"
    docker rmi "${proxy}/${IMAGE}" 2>/dev/null
    echo "✅ 成功"
    exit 0
  fi
done
echo "❌ 所有代理均失败"
exit 1
