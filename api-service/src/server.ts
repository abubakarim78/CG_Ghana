import { config } from './config';
import app from './app';
import { prisma } from './db';
import { logger } from './utils/logger';

async function main() {
  await prisma.$connect();
  logger.info('Database connected');

  app.listen(config.PORT, () => {
    logger.info(`childguard-api listening on :${config.PORT} [${config.NODE_ENV}]`);
  });
}

main().catch((err) => {
  logger.error('Startup failed', { err });
  process.exit(1);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
