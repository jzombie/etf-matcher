#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Get the current time as a string
CURRENT_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Compute the hash of the data directory contents recursively
DATA_DIR_HASH=$(find /app/data -type f -print0 | sort -z | xargs -0 sha256sum | sha256sum | awk '{print $1}')

# Write the JSON file
cat <<EOF > /app/data/data_build_info.json
{
  "time": "${CURRENT_TIME}",
  "hash": "${DATA_DIR_HASH}"
}
EOF

echo "data_build_info.json file created with current time and data directory hash."
