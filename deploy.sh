#!/bin/bash
set -e

echo "Starting deployment..."
cd idl-ris

echo "Running Prisma migrations..."
npm run db:migrate:deploy || {
  echo "⚠ Migration failed, but attempting to continue..."
}

echo "Starting server..."
exec node dist/server.js
