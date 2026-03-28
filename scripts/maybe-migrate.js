#!/usr/bin/env node
const { execSync } = require('child_process');

function run(command) {
  console.log('> ' + command);
  execSync(command, { stdio: 'inherit' });
}

if (!process.env.DATABASE_URL) {
  console.log('DATABASE_URL not set — skipping Prisma migrations.');
  process.exit(0);
}

try {
  console.log('DATABASE_URL detected — running Prisma migrations.');
  run('npx prisma migrate deploy');
} catch (err) {
  console.error('Prisma migrate failed:', err);
  process.exit(1);
}
