#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Ensure we're in a Docker container
/app/docker_build_helpers/./validate_docker_env.sh

# Source the .env file
if [ -f .env ]; then
    export $(cat .env | xargs)
fi

# Navigate to the encryption tool directory
cd /app/backend/rust/encrypt_tool

# TODO: Use release contingent upon build environment
#
# Build the encryption tool
cargo build --release
