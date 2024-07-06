# Makefile

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