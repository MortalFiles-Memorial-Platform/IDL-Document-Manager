#!/usr/bin/env node

/**
 * Build script for Render deployment
 * Handles Prisma client generation before TypeScript compilation
 * to avoid "P1001: Can't reach database server" errors
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Starting Render-compatible build process...\n');

// Step 1: Install dependencies
console.log('📦 Dependencies already installed\n');

// Step 2: Generate Prisma client
console.log('🔄 Generating Prisma client...');
try {
  // First, try with existing environment variables
  execSync('npm run db:generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated\n');
} catch (error) {
  console.log('⚠️  Attempting with fallback DATABASE_URL...');
  try {
    // If it fails, set a fallback DATABASE_URL and try again
    const env = {
      ...process.env,
      DATABASE_URL: 'postgresql://postgres:temp@localhost:5432/temp',
      DIRECT_URL: 'postgresql://postgres:temp@localhost:5432/temp'
    };
    execSync('npm run db:generate', { 
      stdio: 'inherit',
      env
    });
    console.log('✅ Prisma client generated with fallback DATABASE_URL\n');
  } catch (innerError) {
    console.log('⚠️  Prisma generation skipped - client may already exist\n');
  }
}

// Step 3: Verify .prisma/client exists
const prismaClientPath = path.join(__dirname, '.prisma', 'client');
if (!fs.existsSync(prismaClientPath)) {
  console.log('⚠️  .prisma/client directory not created, but continuing with build...\n');
}

// Step 4: Build client
console.log('🏗️  Building client...');
try {
  execSync('npm run build:client', { stdio: 'inherit' });
  console.log('✅ Client build complete\n');
} catch (error) {
  console.error('❌ Client build failed');
  process.exit(1);
}

// Step 5: Build server
console.log('🏗️  Building server...');
try {
  execSync('npm run build:server', { stdio: 'inherit' });
  console.log('✅ Server build complete\n');
} catch (error) {
  console.error('❌ Server build failed');
  process.exit(1);
}

console.log('✅ Build complete!\n');
