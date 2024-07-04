#!/bin/bash

# Function to watch a directory and trigger a build script on changes
watch_directory() {
  local WATCH_DIR=$1
  local BUILD_SCRIPT=$2
  local EXCLUDE_PATTERN=$3
  local DEBOUNCE_TIME=$4

  # Variable to track the last event time
  local LAST_EVENT_TIME=0

  # Function to handle the debounced build
  debounced_build() {
    echo "Handling batch of events..."
    $BUILD_SCRIPT
  }

  # Run inotifywait to watch the directory for changes
  inotifywait -m -r -e modify,create,delete,move --exclude "$EXCLUDE_PATTERN" "$WATCH_DIR" |
  while read -r path action file; do
    echo "The file '$file' at '$path' was $action"

    # Useful for debugging in case this winds up in an infinite loop
    # sleep 5

    # Capture the current time
    CURRENT_TIME=$(date +%s.%N)

    # Calculate the time since the last event
    TIME_DIFF=$(echo "$CURRENT_TIME - $LAST_EVENT_TIME" | bc)

    # If the time difference is greater than the debounce time, trigger the build
    if (( $(echo "$TIME_DIFF > $DEBOUNCE_TIME" | bc -l) )); then
      LAST_EVENT_TIME=$CURRENT_TIME
      debounced_build
    fi
  done
}

# ---------

# FRONTEND WATCHER

# Default parameters
WATCH_DIR="/app/rust/"
BUILD_SCRIPT="./docker_build_helpers/build_rust_frontend.sh"
EXCLUDE_PATTERN='(target.*|Cargo\.lock|.*__AUTOGEN__.*)'
DEBOUNCE_TIME=0.1

# Call the function with the default parameters
watch_directory "$WATCH_DIR" "$BUILD_SCRIPT" "$EXCLUDE_PATTERN" "$DEBOUNCE_TIME" &

# ---------

# BACKEND WATCHER

WATCH_DIR="/app/data"
BUILD_SCRIPT="./docker_build_helpers/encode_data.sh"
EXCLUDE_PATTERN='.*\.enc$'
watch_directory "$WATCH_DIR" "$BUILD_SCRIPT" "$EXCLUDE_PATTERN" "$DEBOUNCE_TIME" &

# Wait for all background processes to complete
wait
