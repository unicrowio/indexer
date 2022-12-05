// pm2 setup
module.exports = {
  apps: [
    {
      name: "indexer-api",
      script: "./build/index.js",
      instances: "1",
      cron_restart: "0 */12 * * *", // restart “At minute 0 past every 12th hour.”
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
