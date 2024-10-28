import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http";

import { FindPostByIDUseCase } from "@application/usecases/post";
import { IFindPostByIDUseCase } from "@domain/usecases/post";
import { prismaClient } from "@infrastructure/persistence/databases/mysql/connection";
import { PostRepositoryPrisma } from "@infrastructure/persistence/repositories/post/PostRepositoryPrisma";
import {
  PostResolver
} from "@interfaces/graphql/resolvers/PostResolver";

interface ApolloContext {
  findPostByIdUseCase: IFindPostByIDUseCase;
}

dotenv.config();
const app = express();
const httpServer = http.createServer(app);
const port = 9000;

const postRepository = new PostRepositoryPrisma(prismaClient);
const findPostByIdUseCase = new FindPostByIDUseCase(postRepository);

const schema = await buildSchema({
  resolvers: [PostResolver],
});

const server = new ApolloServer<ApolloContext>({
  schema,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});
await server.start();

app.use(
  "/graphql",
  cors<cors.CorsRequest>(),
  express.json(),
  expressMiddleware(server, {
    context: async ({}) => ({ findPostByIdUseCase }),
  })
);

await new Promise<void>((resolve) => httpServer.listen({ port }, resolve));
console.log(`🚀 Server ready at http://localhost:${port}/graphql`);
