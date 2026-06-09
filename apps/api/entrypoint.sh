#!/bin/sh
set -e

echo "Running database migrations..."
cd apps/api
./node_modules/.bin/prisma migrate deploy

echo "Starting API..."
cd /app
exec node apps/api/dist/main.js
