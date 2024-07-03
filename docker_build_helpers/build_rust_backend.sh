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

# Run the encryption tool with the input and output file arguments
./target/release/encrypt_tool /app/data/etfs.json /app/data/etfs.json.enc

# Move encoded data files into public data directory
mkdir -p /app/public/data
mv /app/data/*.enc /app/public/data
