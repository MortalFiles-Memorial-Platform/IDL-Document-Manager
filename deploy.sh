#!/bin/bash
set -e

echo "Starting deployment..."
cd idl-ris
echo "Running migrations..."
npm run db:migrate:deploy
echo "Starting server..."
node dist/server.js
