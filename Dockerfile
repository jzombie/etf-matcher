# Base image for building Rust projects
FROM rust:1.79.0 AS rust-base

# Tell `validate_docker_env.sh` that we're in a Docker build
ARG DOCKER_BUILD=1

# Install necessary dependencies
RUN apt-get update && \
    apt-get install -y cmake libz-dev python3 curl openssl && \
    rm -rf /var/lib/apt/lists/*

# Create a non-root user with the same UID and GID as the local user
ARG UID=1000
ARG GID=1000

# Create group if it doesn't exist
RUN if ! getent group $GID; then \
      groupadd -g $GID etfuser; \
    else \
      groupmod -n etfuser $(getent group $GID | cut -d: -f1); \
    fi

# Create user if it doesn't exist
RUN if ! id -u $UID; then \
      useradd -m -u $UID -g $GID -s /bin/bash etfuser; \
    fi

# Ensure the non-root user can access the cargo directory
RUN chown -R $UID:$GID /usr/local/cargo

# Create necessary directories with the correct permissions
RUN mkdir -p /build_artifacts/public/pkg /build_artifacts/public/data /build_artifacts/backend && \
    mkdir -p /app/public && \
    chown -R $UID:$GID /build_artifacts /app/public

# Set the working directory
WORKDIR /app

COPY docker_build_helpers/ ./docker_build_helpers/

# Make all copied scripts executable and create global symlinks (within container context)
RUN for script in /app/docker_build_helpers/*.sh; do \
        chmod +x "$script"; \
        ln -s "$script" /usr/local/bin/$(basename "$script" .sh); \
    done

# Switch to the non-root user
USER etfuser

# ----- BEGIN DATAPACK_EXTRACT BUILD STAGE

# Backend build stage
FROM rust-base AS datapack-extract

# Set the working directory
WORKDIR /app

# Copy data files with correct ownership
COPY --chown=etfuser:etfuser data/ /app/data/

# Switch to the non-root user
USER etfuser

# Run the extraction script
RUN import_datapacks

# ----- END DATAPACK_EXTRACT BUILD STAGE

# ----- BEGIN FRONTEND BUILD STAGE

# Frontend build stage
FROM rust-base AS frontend-build

# Set the working directory
WORKDIR /app

# Switch to the non-root user
USER etfuser

COPY --chown=etfuser:etfuser .env /app/.env

# Install wasm-pack for building the frontend
RUN cargo install wasm-pack

# Copy only Rust frontend files
COPY --chown=etfuser:etfuser rust/ ./rust/

# Set the ENCRYPTED_PASSWORD environment variable for build.rs
ENV ENCRYPTED_PASSWORD your_encrypted_password

# Make build script executable and run it
RUN build_rust_frontend

# ----- END FRONTEND BUILD STAGE

# Final stage
FROM frontend-build AS final

# Switch to the root user to install deps
USER root

# Install necessary dependencies including Node.js
RUN apt-get update && \
    apt-get install -y curl gnupg tini inotify-tools bc && \
    curl -sL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g vite && \
    rm -rf /var/lib/apt/lists/*

# Switch to the non-root user
USER etfuser

# Set the working directory
WORKDIR /app

COPY package.json package.json

# Create directories with the correct permissions
RUN mkdir -p /build_artifacts/public/pkg /build_artifacts/public/data /build_artifacts/backend && \
    chown -R $UID:$GID /build_artifacts /app

# Copy build artifacts (this is so that volume mounts won't replace these)
COPY --chown=etfuser:etfuser --from=datapack-extract /build_artifacts/public/data /build_artifacts/public/data
COPY --chown=etfuser:etfuser --from=frontend-build /app/public/pkg /build_artifacts/public/pkg
COPY --chown=etfuser:etfuser --from=frontend-build /app/.env /build_artifacts/.env

# Copy the rest of the project files
COPY --chown=etfuser:etfuser . .

# Expose port 8000 for the web server
EXPOSE 8000

# Use tini as the entry point (trap SIGINT [Ctrl-C] and exit the Vite server)
ENTRYPOINT ["/usr/bin/tini", "--"]

# TODO: Uncomment if not mounting locally
# CMD ["npm", "run", "build"]
