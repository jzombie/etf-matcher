#!/bin/sh

# Generate a random password
PLAINTEXT_PASSWORD=$(openssl rand -base64 32)

# Write the .env file
cat <<EOF > /app/.env
PLAINTEXT_PASSWORD=${PLAINTEXT_PASSWORD}
EOF
