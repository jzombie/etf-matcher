# By default, Docker Compose uses the directory name as the project name.
# The CONTAINER_NAME is derived from the directory name and service name.
# For example, if the directory name is "helloworldrustwasm" and the service
# name is "dev", the container name will be "helloworldrustwasm-dev-1".
CONTAINER_NAME := helloworldrustwasm-dev-1

# ANSI color codes
GREEN := $(shell tput setaf 2)
RED := $(shell tput setaf 1)
RESET := $(shell tput sgr0)

# Unicode circle symbol
CIRCLE_SYMBOL := ●

# Function to check if the container is running
define check_container_status
  @if [ $$(docker ps -q -f name=$(CONTAINER_NAME)) ]; then \
    echo "$(GREEN)Development container '$(CONTAINER_NAME)' is running. \033[32m$(CIRCLE_SYMBOL)$(RESET)"; \
  else \
    echo "$(RED)Development container '$(CONTAINER_NAME)' is not running. \033[31m$(CIRCLE_SYMBOL)$(RESET)"; \
  fi
endef

# Default target: help
.PHONY: help
help:
	@echo "Available commands:"
	@awk -F ':| ' '/^[a-zA-Z0-9_-]+:/ {print "  make " $$1}' $(MAKEFILE_LIST) | grep -v '^\s*make\s*help'
	@echo "\n"
	$(call check_container_status)

.PHONY: build-dev
build-dev:
	@echo "Building Docker container"
	@DOCKER_BUILDKIT=0 FORCE_COLOR=1 docker compose build

.PHONY: start-dev
start-dev:
	@echo "Starting development container"
	@docker compose up

.PHONY: enter-dev
enter-dev:
	@echo "Entering development container $(CONTAINER_NAME)..."
	@docker exec -it $(CONTAINER_NAME) bash

.PHONY: test
test:
	@echo "Testing..."
	@docker compose up dev-test

.PHONY: build-prod
build-prod:
	@echo "Generating production build..."
	@docker compose build build-dist && docker compose up build-dist
