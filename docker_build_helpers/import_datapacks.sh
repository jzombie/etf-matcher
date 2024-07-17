#!/bin/sh

# Create directories for extracted files and temporary extraction
mkdir -p /build_artifacts/public

# Delete existing data directory if it exists
if [ -d /build_artifacts/public/data ]; then
    rm -rf /build_artifacts/public/data
fi

mkdir -p /build_artifacts/public/data /tmp/unzip_temp

# Extract all zip files from /app/data to the temporary directory and move them to the final directory
for zip_file in /app/data/*.zip; do
    unzip -o "$zip_file" -d /tmp/unzip_temp
    # Move the contents of each extracted directory to the final directory
    for dir in /tmp/unzip_temp/*; do
        if [ -d "$dir" ]; then
            cp -r "$dir"/* /build_artifacts/public/data/
        else
            mv "$dir" /build_artifacts/public/data/
        fi
    done
    # Clean up the temporary directory for the next extraction
    rm -rf /tmp/unzip_temp/*
done

# Remove unnecessary files
find /build_artifacts/public/data -name "__MACOSX" -exec rm -rf {} +

# --- Move to /app/public/data

if [ -d /app/public/data ]; then
    rm -rf /app/public/data
fi

mkdir -p /app/public/data
mv /build_artifacts/public/data  /app/public/data/
