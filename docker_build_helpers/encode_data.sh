#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

cd /app/backend/rust/encrypt_tool

# Loop over all JSON files in the /app/data directory
for json_file in /app/data/*.json; do
    # Get the base name of the file (without the directory and file extension)
    base_name=$(basename "$json_file" .json)
    
    # Run the encryption tool with the input and output file arguments
    ./target/release/encrypt_tool "$json_file" "/app/data/${base_name}.enc"
done

# Move encoded data files into public data directory
mkdir -p /app/public/data
mv /app/data/*.enc /app/public/data
