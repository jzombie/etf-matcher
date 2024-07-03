# Use the official Rust image as the base image
FROM rust:latest

# Install necessary dependencies
RUN apt-get update && \
    apt-get install -y cmake libz-dev python3 curl openssl && \
    rm -rf /var/lib/apt/lists/*

# Install Node.js and npm
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get install -y nodejs

# Install tini
RUN apt-get install -y tini

# Install wasm-pack
RUN cargo install wasm-pack

# Create a new directory for the project
WORKDIR /app

# First, copy only Rust files into the container
COPY rust/ ./rust/

# Build the Rust project with wasm-pack
WORKDIR /app/rust
RUN wasm-pack build --target web --out-dir /app/public/pkg

# Go back to the root directory
WORKDIR /app

# Copy the rest of the project files into the container
COPY . .

# -- BEGIN DATA ENCRYPTION
WORKDIR /app/backend/rust/encrypt_tool

# Copy the Rust encryption source file and compile it
COPY backend/rust/encrypt_tool/ . 
RUN cargo build --release

WORKDIR /app

# Encrypt and compress the data file
RUN ./backend/rust/encrypt_tool/target/release/encrypt_tool data/etfs.json data/etfs.json.enc mypassword
# -- END DATA ENCRYPTION

# Go back to the root directory
WORKDIR /app

# Install Vite
RUN npm install -g vite

# Install project dependencies
RUN npm install

WORKDIR /app/data

# Move the compressed data files into the public/data directory
RUN mkdir -p /app/public/data && mv etfs.json.enc /app/public/data/

WORKDIR /app/public

# Expose port 8000 for the web server
EXPOSE 8000

# Use tini as the entry point (trap SIGINT [Ctrl-C] and exit the Vite server)
ENTRYPOINT ["/usr/bin/tini", "--"]

# Command to run the web server with Vite on port 8000
CMD ["vite", "serve", "--host", "0.0.0.0", "--port", "8000"]
