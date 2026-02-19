
const path = require('path');
const projectRoot = __dirname;

module.exports = {
  apps: [
    {
      name: 'dovi-backend',
      cwd: path.join(projectRoot, 'backend'),
      script: 'dist/index.js',
      interpreter: 'node',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'dovi-frontend',
      cwd: path.join(projectRoot, 'frontend'),
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      interpreter: 'node',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        API_URL: 'http://127.0.0.1:3001',
      },
    },
  ],
};
