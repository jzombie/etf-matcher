#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Ensure we're in a Docker container
/app/docker_build_helpers/./validate_docker_env.sh

# Get the current time as a string
CURRENT_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Compute the hash of the data directory contents recursively
DATA_DIR_HASH=$(find /app/data -type f -print0 | sort -z | xargs -0 sha256sum | sha256sum | awk '{print $1}')

# Write the CSV file
cat <<EOF > /app/data/data_build_info.csv
time,hash
"${CURRENT_TIME}","${DATA_DIR_HASH}"
EOF

echo "data_build_info.csv file created with current time and data directory hash."
