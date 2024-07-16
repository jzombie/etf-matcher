#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Ensure we're in a Docker container
/app/docker_build_helpers/./validate_docker_env.sh

# Source the .env file
if [ -f .env ]; then
    export $(cat /app/.env | xargs)
fi

# Auto-append generated build info (this should come before
# the encryption process)
cd /app/docker_build_helpers && ./generate_data_build_info.sh

cd /app/backend/rust/encrypt_tool

mkdir -p /tmp/output-data

# Loop over all files in the /app/data directory and its subdirectories
find /app/data -type f | while read -r file; do
    # Remove the base directory path and file extension
    relative_path="${file#/app/data/}"
    output_path="${relative_path%.*}.enc"
    
    # Create the necessary subdirectories in the output directory
    mkdir -p "/tmp/output-data/$(dirname "$output_path")"
    
    # Run the encryption tool with the input and output file arguments
    ./target/release/encrypt_tool "$file" "/tmp/output-data/$output_path"
done

# Delete the existing /app/data directory and recreate it
public_data_dir="/app/public/data"
rm -rf "$public_data_dir"
mkdir -p "$public_data_dir"

# Move encoded data files into public data directory
mv /tmp/output-data/* "$public_data_dir"
