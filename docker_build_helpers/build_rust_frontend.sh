#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Install wasm-pack
cargo install wasm-pack

# Build the Rust project with wasm-pack
cd /app/rust
wasm-pack build --target web --out-dir /app/public/pkg
