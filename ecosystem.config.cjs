module.exports = {
  apps: [
    {
      name: 'maxglow-backend',
      script: './backend/src/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT: 7052
      },
      error_file: './logs/backend-err.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm Z'
    },
    {
      name: 'maxglow-frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 7053',
      cwd: './frontend',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      env_production: {
        NODE_ENV: 'production',
        PORT: 7053
      },
      error_file: './logs/frontend-err.log',
      out_file: './logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm Z'
    }
  ]
};
