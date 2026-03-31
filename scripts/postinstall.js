// Conditional postinstall: run `prisma generate` locally but skip on Netlify build environment
const { spawnSync } = require('child_process')

const isNetlify = process.env.NETLIFY === 'true'
const skip = isNetlify || process.env.SKIP_PRISMA_GENERATE === '1'

if (skip) {
  console.log('Skipping prisma generate in postinstall (NETLIFY or SKIP_PRISMA_GENERATE=1)')
  process.exit(0)
}

console.log('Running prisma generate (postinstall)')
const res = spawnSync('npx', ['prisma', 'generate'], { stdio: 'inherit' })
process.exit(res.status)
