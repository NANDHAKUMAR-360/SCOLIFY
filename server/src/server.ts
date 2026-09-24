import app from './app.js';
import { ENV } from './config/env.js';
import { logger } from './utils/logger.js';

const PORT = ENV.PORT;

app.listen(PORT, () => {
  logger.info(`==================================================`);
  logger.info(`SCOLIFY EXPRESS API SERVER RUNNING ON PORT ${PORT}`);
  logger.info(`Environment: ${ENV.NODE_ENV}`);
  logger.info(`Health check: http://localhost:${PORT}/api/v1/health`);
  logger.info(`==================================================`);
});
