# Base image for building Rust projects
FROM rust:latest as rust-base

# Install necessary dependencies
RUN apt-get update && \
    apt-get install -y cmake libz-dev python3 curl openssl && \
    rm -rf /var/lib/apt/lists/*

# ----- BEGIN BACKEND BUILD STAGE

# Backend build stage
FROM rust-base as backend-build

# Create a new directory for the project
WORKDIR /app

# Copy only Rust backend files
COPY backend/rust/encrypt_tool/ ./backend/rust/encrypt_tool/
COPY data/ ./data/
COPY docker_build_helpers/build_rust_backend.sh ./docker_build_helpers/

# Make build script executable and run it
RUN chmod +x ./docker_build_helpers/build_rust_backend.sh && ./docker_build_helpers/build_rust_backend.sh

# ----- END BACKEND BUILD STAGE

# ----- BEGIN FRONTEND BUILD STAGE

# Frontend build stage
FROM rust-base as frontend-build

# Install wasm-pack for building the frontend
RUN cargo install wasm-pack

# Create a new directory for the project
WORKDIR /app

# Copy only Rust frontend files
COPY rust/ ./rust/
COPY docker_build_helpers/build_rust_frontend.sh ./docker_build_helpers/

# Make build script executable and run it
RUN chmod +x ./docker_build_helpers/build_rust_frontend.sh && ./docker_build_helpers/build_rust_frontend.sh

# ----- END FRONTEND BUILD STAGE

# Final stage
FROM node:20 as final

# Install tini
RUN apt-get update && apt-get install -y tini && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy frontend build artifacts
COPY --from=frontend-build /app/public/pkg /app/public/pkg

# Copy backend build artifacts
COPY --from=backend-build /app/public/data /app/public/data

COPY package.json package.json
# COPY node_modules/ ./node_modules # TODO: Enable once populated

# Install Vite and project dependencies
RUN npm install -g vite && npm install

# Copy the rest of the project files
COPY . .

WORKDIR /app/public

# Expose port 8000 for the web server
EXPOSE 8000

# Use tini as the entry point (trap SIGINT [Ctrl-C] and exit the Vite server)
ENTRYPOINT ["/usr/bin/tini", "--"]

# Command to run the web server with Vite on port 8000
CMD ["vite", "serve", "--host", "0.0.0.0", "--port", "8000"]
