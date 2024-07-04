#!/bin/bash

# Directory to watch
WATCH_DIR="/app/rust/"

# Exclude pattern
#
# This pattern excludes the following:
# 1. target.*                     : Any file or directory that starts with 'target'
# 2. Cargo\.lock                  : The 'Cargo.lock' file
# 3. .*__AUTOGEN__[^/]*\.rs$      : Any file that starts with '__AUTOGEN__'
EXCLUDE_PATTERN='(target.*|Cargo\.lock|.*__AUTOGEN__.*)'

# Time to wait (in seconds) before executing the build script after the last event
DEBOUNCE_TIME=0.1

# Variable to track the last event time
LAST_EVENT_TIME=0

# Function to handle the debounced build
debounced_build() {
  echo "Handling batch of events..."
  ./docker_build_helpers/build_rust_frontend.sh
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
