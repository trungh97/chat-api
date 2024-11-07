import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import RedisStore from "connect-redis";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import http from "http";
import "reflect-metadata";
import { buildSchema } from "type-graphql";

import { redisClient } from "@infrastructure/persistence/databases/redis/connection";
import { UserResolver } from "@interfaces/graphql/resolvers";
import { PostResolver } from "@interfaces/graphql/resolvers/PostResolver";

dotenv.config();
const port = 9000;
const __prod__ = process.env.NODE_ENV === "production";

const main = async () => {
  const app = express();
  const httpServer = http.createServer(app);

  const schema = await buildSchema({
    resolvers: [PostResolver, UserResolver],
  });

  const server = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
  await server.start();

  await redisClient.connect().catch((error) => console.error(error));

  // Initialize Redis Store
  const redisStore = new RedisStore({
    client: redisClient,
    prefix: "chat:",
  });

  app.use(
    "/graphql",
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req, res }) => ({ req, res }),
    })
  );

  // Initialize Session Storage
  app.use(
    session({
      name: "chat_session",
      store: redisStore,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
        sameSite: "lax",
        secure: __prod__,
      },
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET,
      resave: false,
    })
  );

  await new Promise<void>(() =>
    httpServer.listen({ port }, () => {
      console.log(`🚀 Server ready at http://localhost:${port}/graphql`);
    })
  );
};

main().catch((error) => console.error(error));
