# Base image for building Rust projects
FROM rust:latest as rust-base

# Install necessary dependencies
RUN apt-get update && \
    apt-get install -y cmake libz-dev python3 curl openssl && \
    rm -rf /var/lib/apt/lists/*

# Create a new directory for the project
WORKDIR /app

FROM rust-base as env-build

# Copy only Rust backend files
COPY backend/rust ./backend/rust
COPY docker_build_helpers/ ./docker_build_helpers/

# Make build script executable and run it
RUN chmod +x ./docker_build_helpers/generate_env.sh && ./docker_build_helpers/generate_env.sh
RUN chmod +x ./docker_build_helpers/encrypt_password.sh && ./docker_build_helpers/encrypt_password.sh

# ----- BEGIN BACKEND BUILD STAGE

# Backend build stage
FROM rust-base as backend-build

COPY --from=env-build app/.env /app/.env

# Copy only Rust backend files
COPY backend/rust/ ./backend/rust/
COPY docker_build_helpers/ ./docker_build_helpers/

# Make build script executable and run it
RUN chmod +x ./docker_build_helpers/build_rust_backend.sh && ./docker_build_helpers/build_rust_backend.sh

COPY data/ ./data/

# Make build script executable and run it
RUN chmod +x ./docker_build_helpers/encode_data.sh && ./docker_build_helpers/encode_data.sh

# ----- END BACKEND BUILD STAGE

# ----- BEGIN FRONTEND BUILD STAGE

# Frontend build stage
FROM rust-base as frontend-build

COPY --from=env-build app/.env /app/.env

# Install wasm-pack for building the frontend
RUN cargo install wasm-pack

# Copy only Rust frontend files
COPY rust/ ./rust/
COPY docker_build_helpers/ ./docker_build_helpers/

# Set the ENCRYPTED_PASSWORD environment variable for build.rs
ENV ENCRYPTED_PASSWORD your_encrypted_password

# Make build script executable and run it
RUN chmod +x ./docker_build_helpers/build_rust_frontend.sh && ./docker_build_helpers/build_rust_frontend.sh

# ----- END FRONTEND BUILD STAGE

# Final stage
FROM frontend-build as final

# Install necessary dependencies including Node.js
RUN apt-get update && \
    apt-get install -y curl gnupg tini inotify-tools && \
    curl -sL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g vite && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

COPY package.json package.json
# COPY node_modules/ ./node_modules # TODO: Enable once populated

# Install Vite and project dependencies
RUN npm install -g vite && npm install

# Create a directory to store build artifacts
RUN mkdir -p /build_artifacts/pkg /build_artifacts/data /build_artifacts/backend

# Copy build artifacts
COPY --from=frontend-build /app/.env /build_artifacts/.env
COPY --from=frontend-build /app/public/pkg /build_artifacts/pkg
COPY --from=backend-build /app/public/data /build_artifacts/data

# Copy the rest of the project files
COPY . .

# Expose port 8000 for the web server
EXPOSE 8000

# Use tini as the entry point (trap SIGINT [Ctrl-C] and exit the Vite server)
ENTRYPOINT ["/usr/bin/tini", "--"]

# Command to run the web server with Vite on port 8000
CMD ["vite", "serve", "--host", "0.0.0.0", "--port", "8000"]
