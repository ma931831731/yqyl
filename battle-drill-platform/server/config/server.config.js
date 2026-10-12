import { join } from 'node:path';

export const SERVER_CONFIG = {
  port: Number(process.env.PORT || 5173),
  host: '0.0.0.0',
  root: process.cwd(),
  uploadsDir: join(process.cwd(), 'uploads')
};
