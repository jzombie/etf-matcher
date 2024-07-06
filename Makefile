# Makefile

# By default, Docker Compose uses the directory name as the project name.
# The CONTAINER_NAME is derived from the directory name and service name.
# For example, if the directory name is "helloworldrustwasm" and the service
# name is "dev", the container name will be "helloworldrustwasm-dev-1".
CONTAINER_NAME := helloworldrustwasm-dev-1

# Default target: help
.PHONY: help
help:
	@echo "Available commands:"
	@awk -F ':| ' '/^[a-zA-Z0-9_-]+:/ {print "  make " $$1}' $(MAKEFILE_LIST) | grep -v '^\s*make\s*help' | sort

.PHONY: start-dev-container
start-dev-container:
	@echo "Starting development container"
	@docker compose up

.PHONY: enter-container
enter-container:
	@echo "Entering container $(CONTAINER_NAME)..."
	@docker exec -it $(CONTAINER_NAME) bash
