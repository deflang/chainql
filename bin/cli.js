#!/usr/bin/env node

import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const serverPath = join(__dirname, '../dist/index.js');

if (!existsSync(serverPath)) {
  console.error('❌ Server not built. Run: npm run build');
  process.exit(1);
}

// Import and run your server
try {
  await import(serverPath);
} catch (error) {
  console.error('❌ Failed to start server:', error.message);
  process.exit(1);
}