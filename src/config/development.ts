import { Config } from "./config";
import dotenv from 'dotenv'

dotenv.config();

const development: Config = {
  app: {
    port: process.env.PORT as unknown as number || 9000,
    frontendUrl: process.env.FRONTEND_URI
  },
  db: {
    mysql: {
      host: process.env.MYSQL_HOST as unknown as string,
      user: process.env.MYSQL_USERNAME as unknown as string,
      password: process.env.MYSQL_PASSWORD as unknown as string,
      database: process.env.MYSQL_DATABASE as unknown as string
    }
  },
  cache: {
    redis: {
      host: process.env.REDIS_HOST as unknown as string,
      port: process.env.REDIS_PORT as unknown as number,
      database: process.env.REDIS_DATABASE as unknown as number,
      secret: process.env.SESSION_SECRET as unknown as string
    }
  },
  session: {
    expire: process.env.SESSION_EXPIRE as unknown as number,
    prefix: process.env.SESSION_PREFIX as unknown as string
  },
  auth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as unknown as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as unknown as string,
      callbackUrl: process.env.GOOGLE_REDIRECT_URI as unknown as string
    }
  }
}

export default development