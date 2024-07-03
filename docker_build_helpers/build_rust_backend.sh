#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Source the .env file
if [ -f .env ]; then
    export $(cat .env | xargs)
fi

# Navigate to the encryption tool directory
cd /app/backend/rust/encrypt_tool

# Build the encryption tool
cargo build --release
