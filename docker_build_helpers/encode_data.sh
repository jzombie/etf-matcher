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

# Loop over all CSV files in the /app/data directory
for json_file in /app/data/*.csv; do
    # Get the base name of the file (without the directory and file extension)
    base_name=$(basename "$json_file" .csv)
    
    # TODO: Use release contingent on build environment
    #
    # Run the encryption tool with the input and output file arguments
    ./target/release/encrypt_tool "$json_file" "/app/data/${base_name}.enc"
done

# Move encoded data files into public data directory
mkdir -p /app/public/data
mv /app/data/*.enc /app/public/data
