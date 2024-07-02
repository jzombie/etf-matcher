#!/bin/bash

# Disabling `buildkit` is useful for debugging command outputs
DOCKER_BUILDKIT=0 docker build -t wasm-hello-world .
