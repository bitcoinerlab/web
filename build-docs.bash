#!/bin/bash

# Get current working directory
CURRENT_DIR=$(pwd)

# Directories to process
declare -a dirs=("descriptors" "discovery" "miniscript" "explorer")

# Loop over each directory
for dir in "${dirs[@]}"; do
  # Navigate to the directory
  cd "../${dir}"

  # Generate webdocs
  npm run webdocs

  # Ensure the destination directory exists
  mkdir -p "${CURRENT_DIR}/dist/public/docs/${dir}"

  # Copy generated docs to the desired location using relative paths
  cp -r webdocs/* "${CURRENT_DIR}/dist/public/docs/${dir}/"
  cp README.md "${CURRENT_DIR}/dist/public/docs/${dir}/"

  # Navigate back to the initial directory
  cd "${CURRENT_DIR}"
done

