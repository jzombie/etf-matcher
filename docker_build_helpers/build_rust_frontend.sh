#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Ensure we're in a Docker container
/app/docker_build_helpers/./validate_docker_env.sh

# Source the .env file
if [ -f .env ]; then
    export $(cat .env | xargs)
fi

# Install wasm-pack
cargo install wasm-pack

# Build the Rust project with wasm-pack
cd /app/rust
wasm-pack build --target web --out-dir /app/public/pkg
