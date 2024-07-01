# Use the official Rust image as the base image
FROM rust:latest

# Install necessary dependencies
RUN apt-get update && \
    apt-get install -y cmake libz-dev python3 gzip && \
    rm -rf /var/lib/apt/lists/*

# Install wasm-pack
RUN cargo install wasm-pack

# Copy the original JSON data to the container
COPY data.json /usr/src/app/data.json

# Run the gzip command to compress the JSON data
RUN gzip /usr/src/app/data.json

# Create a new directory for the project
WORKDIR /usr/src/app

# Create a new Rust project
RUN cargo new --lib hello-wasm
WORKDIR /usr/src/app/hello-wasm

# Copy the source code into the container
COPY src/lib.rs src/lib.rs
COPY Cargo.toml Cargo.toml

# Move the compressed data file to the project directory
RUN mv /usr/src/app/data.json.gz /usr/src/app/hello-wasm/data.json.gz

# Build the Rust project with wasm-pack
RUN wasm-pack build --target web

# Copy the HTML file into the container
COPY index.html ./index.html

# Expose port 8000 for the web server
EXPOSE 8000

# Command to run the web server
CMD ["python3", "-m", "http.server"]
