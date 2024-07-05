#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Ensure we're in a Docker container
/app/docker_build_helpers/./validate_docker_env.sh

# Build the encryption utility
cd /app/backend/rust/encrypt_password
cargo build --release

# Run the encryption utility to get the key, IV, and encrypted password
output=$(./target/release/encrypt_password "$PLAINTEXT_PASSWORD")

# Extract the key, IV, and encrypted password from the output
key=$(echo "$output" | grep 'Key' | awk -F '[[]|[]]' '{print $2}' | tr -s ' ' ',' | sed 's/^,//;s/,$//')
iv=$(echo "$output" | grep 'IV' | awk -F '[[]|[]]' '{print $2}' | tr -s ' ' ',' | sed 's/^,//;s/,$//')
encrypted_password=$(echo "$output" | grep 'Encrypted Password' | awk -F '[[]|[]]' '{print $2}' | tr -s ' ' ',' | sed 's/^,//;s/,$//')

# Construct the ENCRYPTED_PASSWORD variable
echo "ENCRYPTED_PASSWORD=\"$encrypted_password\"" >> /app/.env
echo "KEY=\"$key\"" >> /app/.env
echo "IV=\"$iv\"" >> /app/.env

cat /app/.env
