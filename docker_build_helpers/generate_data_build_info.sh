#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Get the current time as a string
CURRENT_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Write the JSON file
cat <<EOF > /app/data/data_build_info.json
{
  "time": "${CURRENT_TIME}"
}
EOF

echo "data_build_info.json file created."
