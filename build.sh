#!/bin/bash

# Force installation of Rollup Linux binaries
npm install @rollup/rollup-linux-x64-gnu@4.9.6 --no-save

# Run the client build
npm run build:client

# Copy files for server deployment
node scripts/copy-files.js

echo "Build completed successfully" 