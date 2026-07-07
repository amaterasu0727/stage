const { defineConfig } = require('@prisma/config');
const process = require('process');

if (typeof process.loadEnvFile === 'function') {
  process.loadEnvFile();
}

module.exports = defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'node prisma/seed.js',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  }
});
