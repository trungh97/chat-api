import "reflect-metadata";
import { PrismaClient } from "@prisma/client";
import { Container } from "inversify";
import { TYPES } from "./types";

import { FindPostByIDUseCase } from "@application/usecases/post";
import { IPostRepository } from "@domain/repositories";
import { IFindPostByIDUseCase } from "@domain/usecases/post";
import { PostRepositoryPrisma } from "@infrastructure/persistence/repositories/post/PostRepositoryPrisma";
import { prismaClient } from "@infrastructure/persistence/databases/mysql/connection";

const container = new Container();

// Binding prisma client
container.bind<PrismaClient>(TYPES.PrismaClient).toConstantValue(prismaClient);

// Binding repositories
container
  .bind<IPostRepository>(TYPES.PostRepositoryPrisma)
  .to(PostRepositoryPrisma);

// Binding use cases
container
  .bind<IFindPostByIDUseCase>(TYPES.FindPostByIDUseCase)
  .to(FindPostByIDUseCase);

export { container };
