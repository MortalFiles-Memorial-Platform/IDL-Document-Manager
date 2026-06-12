#!/bin/bash

# Build script for Render - generates Prisma client before TypeScript compilation
# This prevents "P1001: Can't reach database server" errors during build

echo "🔨 Starting build process..."

# Step 1: Install dependencies (npm ci already done by Render)
echo "📦 Dependencies already installed"

# Step 2: Generate Prisma client (before TypeScript compilation)
# This does NOT require database connection, only reads the schema
echo "🔄 Generating Prisma client..."
npm run db:generate || {
  echo "⚠️  Prisma generation skipped (may be already generated)"
}

# Step 3: Build client
echo "🏗️  Building client..."
npm run build:client || {
  echo "❌ Client build failed"
  exit 1
}

# Step 4: Build server (now has Prisma client pre-generated)
echo "🏗️  Building server..."
npm run build:server || {
  echo "❌ Server build failed"
  exit 1
}

echo "✅ Build complete!"
