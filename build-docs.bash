#!/bin/bash

# Get current working directory
CURRENT_DIR=$(pwd)

# Refresh rewind2 guide content from playground
cp "${CURRENT_DIR}/../playground/descriptors/rewind2/README.md" \
  "${CURRENT_DIR}/src/guides/rewind2.md"

# Directories to process
declare -a dirs=("descriptors" "coinselect" "discovery" "miniscript" "explorer")

# Loop over each directory
for dir in "${dirs[@]}"; do
  # Navigate to the directory
  cd "../${dir}"

  # Generate webdocs
  npm run webdocs

  # Ensure the destination directory exists
  rm -rf "${CURRENT_DIR}/dist/public/docs/${dir}/"
  mkdir "${CURRENT_DIR}/dist/public/docs/${dir}"

  # Copy generated docs to the desired location using relative paths
  cp -r webdocs/* "${CURRENT_DIR}/dist/public/docs/${dir}/"
  cp README.md "${CURRENT_DIR}/dist/public/docs/${dir}/"

  # Navigate back to the initial directory
  cd "${CURRENT_DIR}"
done
