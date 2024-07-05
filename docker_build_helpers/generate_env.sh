#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

# Check if the .env file exists
if [ ! -f /app/.env ]; then
  # Generate a random password
  PLAINTEXT_PASSWORD=$(openssl rand -base64 32)

  # Write the .env file
  cat <<EOF > /app/.env
PLAINTEXT_PASSWORD=${PLAINTEXT_PASSWORD}
EOF

  echo ".env file created with a new password."
else
  echo ".env file already exists. Skipping password generation."
fi
