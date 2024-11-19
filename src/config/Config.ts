import dotenv from "dotenv";
import development from "./development";

dotenv.config();

export interface Config {
  app: {
    port: number;
    frontendUrl: string;
  };
  db: {
    mysql: {
      host: string;
      user: string;
      password: string;
      database: string;
    };
  };
  cache: {
    redis: {
      host: string;
      port: number;
      database: number;
      secret: string;
    };
  };
  session: {
    expire: number;
    prefix: string;
  };
  auth: {
    google: {
      clientId: string;
      clientSecret: string;
      callbackUrl: string;
    };
  };
}

const env = process.env.NODE_ENV || "development";

const configs = {
  development,
};

const config = configs[env] as Config;

export default config;
