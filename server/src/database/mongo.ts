import env from '../utils/validateEnv';
import mongoose from 'mongoose';

mongoose
  .connect(env.MONGO_CONNECTION_STRING)
  .then(() => console.log('Successfully connected to MongoDB!'))
  .catch((error) => console.error(error));
