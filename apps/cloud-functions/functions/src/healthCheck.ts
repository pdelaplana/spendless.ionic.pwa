import * as logger from 'firebase-functions/logger';
import { onRequest } from 'firebase-functions/v2/https';

export const healthcheck = onRequest((_request, response) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
  };

  logger.info('Healthcheck', healthCheck, { structuredData: true });

  response.setHeader('Content-Type', 'application/json');
  response.send(JSON.stringify(healthCheck, null, 3));
});
