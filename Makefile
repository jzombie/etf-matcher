# By default, Docker Compose uses the directory name as the project name.
# The CONTAINER_NAME is derived from the directory name and service name.
# For example, if the directory name is "helloworldrustwasm" and the service
# name is "dev", the container name will be "helloworldrustwasm-dev-1".
CONTAINER_NAME := helloworldrustwasm-dev-1

# ANSI color codes
GREEN := $(shell tput setaf 2)
RED := $(shell tput setaf 1)
RESET := $(shell tput sgr0)

# Unicode circle symbols
CIRCLE_SYMBOL_GREEN := \033[32m●\033[0m
CIRCLE_SYMBOL_RED := \033[31m●\033[0m

# Function to check if the container is running
define check_container_status
  @if [ $$(docker ps -q -f name=$(CONTAINER_NAME)) ]; then \
    echo "$(GREEN)Development container '$(CONTAINER_NAME)' is running. $(CIRCLE_SYMBOL_GREEN)$(RESET)"; \
  else \
    echo "$(RED)Development container '$(CONTAINER_NAME)' is not running. $(CIRCLE_SYMBOL_RED)$(RESET)"; \
  fi
endef

# Function to display command status
define command_status
  @if [ $$(docker ps -q -f name=$(CONTAINER_NAME)) ]; then \
    echo "$1 $(CIRCLE_SYMBOL_GREEN)"; \
  else \
    echo "$1 $(CIRCLE_SYMBOL_RED)"; \
  fi
endef

# Default target: help
.PHONY: help
help:
	@echo "Available commands:"
	@awk -F ':| ' '/^[a-zA-Z0-9_-]+:/ {print $$1}' $(MAKEFILE_LIST) | while read cmd; do \
	  case $$cmd in \
	    start-dev|enter-dev) \
	      if [ $$(docker ps -q -f name=$(CONTAINER_NAME)) ]; then \
	        echo "  make $$cmd $(CIRCLE_SYMBOL_GREEN)"; \
	      else \
	        echo "  make $$cmd $(CIRCLE_SYMBOL_RED)"; \
	      fi \
	      ;; \
	    *) \
	      echo "  make $$cmd"; \
	      ;; \
	  esac; \
	done
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
