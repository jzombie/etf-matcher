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

# Run inotifywait to watch the directory for changes
inotifywait -m -r -e modify,create,delete,move --exclude "$EXCLUDE_PATTERN" "$WATCH_DIR" |
while read path action file; do
  echo "The file '$file' at '$path' was $action"

  # Useful for debugging in case this winds up in an infinite loop
  # sleep 5

  ./docker_build_helpers/build_rust_frontend.sh
done
