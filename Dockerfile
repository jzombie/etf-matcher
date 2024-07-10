# Base image for building Rust projects
FROM rust:1.79.0 as rust-base

# Tell `validate_docker_env.sh` that we're in a Docker build
ARG DOCKER_BUILD=1

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
    apt-get install -y curl gnupg tini inotify-tools bc && \
    curl -sL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g vite && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

COPY package.json package.json

# TODO: Skip if mounting locally
#
# Install JS project dependencies
RUN npm install --verbose

# Create a directory to store build artifacts
RUN mkdir -p /build_artifacts/public/pkg /build_artifacts/public/data /build_artifacts/backend

# Copy build artifacts
#
# Note: The backend is copied into here as well to support `dev-rust-hmr`service
COPY --from=backend-build  /app/backend /build_artifacts/backend
COPY --from=backend-build /app/public/data /build_artifacts/public/data
COPY --from=frontend-build /app/public/pkg /build_artifacts/public/pkg
COPY --from=frontend-build /app/.env /build_artifacts/.env

# Copy the rest of the project files
COPY . .

# Expose port 8000 for the web server
EXPOSE 8000

# Use tini as the entry point (trap SIGINT [Ctrl-C] and exit the Vite server)
ENTRYPOINT ["/usr/bin/tini", "--"]

CMD ["npm", "run", "serve"]

