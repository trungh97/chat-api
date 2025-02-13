import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import config from "@config/config";
import { redisClient } from "@infrastructure/persistence/databases/redis/connection";
import {
  ConversationResolver,
  PostResolver,
  UserResolver,
} from "@interfaces/graphql/resolvers";
import { COOKIE_NAME } from "@shared/constants";
import RedisStore from "connect-redis";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import { useServer } from "graphql-ws/use/ws";
import http from "http";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { Context } from "types";
import { WebSocketServer } from "ws";
dotenv.config();

const port = config.app.port;
const __prod__ = process.env.NODE_ENV === "production";

const main = async () => {
  const app = express();
  const httpServer = http.createServer(app);
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: false }));

  const schema = await buildSchema({
    resolvers: [PostResolver, UserResolver, ConversationResolver],
  });

  const webSocketServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  const serverCleanUp = useServer({ schema }, webSocketServer);

  const server = new ApolloServer<Context>({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanUp.dispose();
            },
          };
        },
      },
    ],
  });
  await server.start();

  await redisClient.connect().catch((error) => console.error(error));

  // Initialize Redis Store
  const redisStore = new RedisStore({
    client: redisClient,
    prefix: "chat:",
  });

  // Initialize Session Storage
  app.use(
    session({
      name: COOKIE_NAME,
      store: redisStore,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
        sameSite: "lax",
        secure: __prod__,
      },
      saveUninitialized: false,
      secret: config.cache.redis.secret,
      resave: false,
    })
  );

  app.use(
    "/graphql",
    cors<cors.CorsRequest>({
      origin: config.app.frontendUrl,
      credentials: true,
    }),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req, res }) => ({ req, res }),
    })
  );

  await new Promise<void>(() =>
    httpServer.listen({ port }, () => {
      console.log(`🚀 Server ready at http://localhost:${port}/graphql`);
    })
  );
};

main().catch((error) => console.error(error));
