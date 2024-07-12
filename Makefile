# By default, Docker Compose uses the directory name as the project name.
# The CONTAINER_NAME is derived from the directory name and service name.
# For example, if the directory name is "etf-matcher" and the service
# name is "dev", the container name will be "etf-matcher-dev-1".
CONTAINER_NAME := etf-matcher-dev-1

# ANSI color codes
GREEN := $(shell tput setaf 2)
RED := $(shell tput setaf 1)
YELLOW := $(shell tput setaf 3)
RESET := $(shell tput sgr0)
BOLD := $(shell tput bold)

# Unicode circle symbols
CIRCLE_SYMBOL_GREEN := \033[32m●\033[0m
CIRCLE_SYMBOL_RED := \033[31m●\033[0m
CIRCLE_SYMBOL_GRAY := \033[90m●\033[0m
CIRCLE_SYMBOL_YELLOW := \033[33m●\033[0m

# Function to check if the container is running
define check_container_status
  @if [ $$(docker ps -q -f name=$(CONTAINER_NAME)) ]; then \
    echo "$(GREEN)Development container '$(CONTAINER_NAME)' is running. $(CIRCLE_SYMBOL_GREEN)$(RESET)"; \
  else \
    echo "$(RED)Development container '$(CONTAINER_NAME)' is not running. $(CIRCLE_SYMBOL_RED)$(RESET)"; \
  fi
endef

# Default target: help
.PHONY: help
help:
	@echo "$(BOLD)Available commands:$(RESET)"
	@awk -F ':| ' '/^[a-zA-Z0-9_-]+:/ {print $$1}' $(MAKEFILE_LIST) | while read cmd; do \
	  case $$cmd in \
	    start-dev|enter-dev|stop-dev) \
	      if [ $$(docker ps -q -f name=$(CONTAINER_NAME)) ]; then \
	        printf "  $(CIRCLE_SYMBOL_GREEN) make %-15s\n" $$cmd; \
	      else \
	        printf "  $(CIRCLE_SYMBOL_RED) make %-15s\n" $$cmd; \
	      fi \
	      ;; \
			help) \
	      printf "  $(CIRCLE_SYMBOL_YELLOW) make %-15s ← $(BOLD)you are here$(RESET)\n" $$cmd; \
	      ;; \
	    *) \
	      printf "  $(CIRCLE_SYMBOL_GRAY) make %-15s\n" $$cmd; \
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

.PHONY: stop-dev
stop-dev:
	@echo "Stopping development container"
	@docker compose down

.PHONY: test
test:
	@echo "Testing..."
	@docker compose up dev-test

.PHONY: build-prod
build-prod:
	@echo "Generating production build..."
	@docker compose build build-dist && docker compose up build-dist
