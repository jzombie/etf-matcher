# Use the official Rust image as the base image
FROM rust:latest

# Install necessary dependencies
RUN apt-get update && \
    apt-get install -y cmake libz-dev python3 gzip && \
    rm -rf /var/lib/apt/lists/*

# Install wasm-pack
RUN cargo install wasm-pack

# Create a new directory for the project
WORKDIR /app

# TODO: Only copy rust files at first
# Copy all project files into the container
COPY . .

# Build the Rust project with wasm-pack
WORKDIR /app/rust
RUN wasm-pack build --target web --out-dir /app/public/pkg

WORKDIR /app/data

# Compress all files in the data directory in place
RUN find . -type f -exec gzip {} \;

# Move the compressed data files into the public/data directory
RUN mkdir -p /app/public/data && mv *.gz /app/public/data/

WORKDIR /app/public

# Expose port 8000 for the web server
EXPOSE 8000

# Command to run the web server
CMD ["python3", "-m", "http.server"]
