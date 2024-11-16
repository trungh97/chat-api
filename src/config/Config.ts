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
