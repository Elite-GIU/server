import * as dotenv from 'dotenv';

dotenv.config();

export const AppConfig = {
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  apiPrefix: 'api/v1',
  mongoUri: process.env.MONGO_URI
};
