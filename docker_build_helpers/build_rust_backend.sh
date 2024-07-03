#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Compile the encryption tool
cd /app/backend/rust/encrypt_tool
cargo build --release

# Encrypt and compress the data file
cd /app
./backend/rust/encrypt_tool/target/release/encrypt_tool data/etfs.json data/etfs.json.enc mypassword

# Move encoded data files into public data directory
mkdir -p /app/public/data
mv /app/data/*.enc /app/public/data