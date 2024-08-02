import 'dotenv/config';
import { cleanEnv, str, port, email, url } from 'envalid';

export default cleanEnv(process.env, {
  PORT: port(),
  NODE_ENV: str(),
  MONGO_CONNECTION_STRING: str(),
  SECRET: str(),
  COOKIE_DOMAIN: str(),
  CLIENT_URL: url(),
  HOST_EMAIL: email(),
  APP_PASSWORD: str(),
});
