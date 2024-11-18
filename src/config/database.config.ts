import * as dotenv from 'dotenv';

dotenv.config();

export const DatabaseConfig = {
  uri: process.env.MONGO_URI,
  options: {
    dbName: 'e-learning', 
  },
};
