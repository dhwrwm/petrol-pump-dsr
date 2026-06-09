#!/bin/sh
set -e

echo "Running database migrations..."
cd /app/apps/api
./node_modules/.bin/prisma migrate deploy

echo "Starting API..."
exec node /app/apps/api/dist/main.js
