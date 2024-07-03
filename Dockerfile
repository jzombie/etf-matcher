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

# Create a new directory for the project
WORKDIR /app

# First, copy only Rust files into the container
COPY rust/ ./rust/
COPY backend/rust/encrypt_tool/ ./backend/rust/encrypt_tool/

RUN mkdir -p docker_build_helpers public/data
COPY rust/ ./rust/
COPY docker_build_helpers/ ./docker_build_helpers/

# Make Rust build scripts executable
RUN chmod +x docker_build_helpers/*.sh

# Run the build scripts
RUN ./docker_build_helpers/build_rust_frontend.sh

# The "backend" is built after the frontend due to it having potentially more changing data
COPY backend/ ./backend/
COPY data/ ./data/
RUN ./docker_build_helpers/build_rust_backend.sh

# Copy the rest of the project files into the container
COPY . .

# Switch back to the public directory
WORKDIR /app/public

RUN npm install -g vite && npm install

# Expose port 8000 for the web server
EXPOSE 8000

# Use tini as the entry point (trap SIGINT [Ctrl-C] and exit the Vite server)
ENTRYPOINT ["/usr/bin/tini", "--"]

# Command to run the web server with Vite on port 8000
CMD ["vite", "serve", "--host", "0.0.0.0", "--port", "8000"]
