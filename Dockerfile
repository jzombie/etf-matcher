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

# ----- BEGIN DATAPACK_EXTRACT BUILD STAGE

# Backend build stage
FROM rust-base as datapack-extract

# Copy data files
COPY data/ /app/data/

# Create directory for extracted files
RUN mkdir -p /build_artifacts/public/data

# Extract all zip files from /app/data to /build_artifacts/public/data
RUN find /app/data -name "*.zip" -exec unzip -o {} -d /build_artifacts/public/data/ \;

# TODO: Ideally we should try to extract data from a file from each zip file to ensure
# the local .env is set up correct

# ----- END DATAPACK_EXTRACT BUILD STAGE

# ----- BEGIN FRONTEND BUILD STAGE

# Frontend build stage
FROM rust-base as frontend-build

COPY .env /app/.env

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

# TODO: Uncomment if not mounting locally
#
# Install JS project dependencies
# RUN npm install --verbose

# Create a directory to store build artifacts
RUN mkdir -p /build_artifacts/public/pkg /build_artifacts/public/data /build_artifacts/backend

# Copy build artifacts (this is so that volume mounts won't replace these)
#
COPY --from=datapack-extract /build_artifacts/public/data /build_artifacts/public/data
COPY --from=frontend-build /app/public/pkg /build_artifacts/public/pkg
COPY --from=frontend-build /app/.env /build_artifacts/.env

# Copy the rest of the project files
COPY . .

# Expose port 8000 for the web server
EXPOSE 8000

# Use tini as the entry point (trap SIGINT [Ctrl-C] and exit the Vite server)
ENTRYPOINT ["/usr/bin/tini", "--"]

CMD ["npm", "run", "serve"]

