#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

is_docker() {
  # Check for .dockerenv file
  if [ -f /.dockerenv ]; then
    return 0
  fi

  # Check for Docker in cgroup
  if grep -qE '/docker|/lxc/' /proc/1/cgroup; then
    return 0
  fi

  return 1
}

if is_docker; then
  echo "Running inside a Docker container"
else
  # Check if Docker build context is present
  if [ -n "$DOCKER_BUILD" ]; then
    echo "Running during Docker build"
  else
    echo "Not running inside a Docker container or build context"
    exit 1
  fi
fi