import { PrismaClient } from "@prisma/client";
import { Container } from "inversify";
import "reflect-metadata";
import { TYPES } from "./types";

import { FindPostByIDUseCase } from "@application/usecases/post";
import { RegisterUserUseCase } from "@application/usecases/user";
import { IPostRepository, IUserRepository } from "@domain/repositories";
import { IFindPostByIDUseCase } from "@domain/usecases/post";
import { IRegisterUserUseCase } from "@domain/usecases/user";
import { prismaClient } from "@infrastructure/persistence/databases/mysql/connection";
import { redisClient } from "@infrastructure/persistence/databases/redis/connection";
import { ILogger, WinstonLogger } from "@infrastructure/persistence/logger";
import { PostPrismaRepository } from "@infrastructure/persistence/repositories/post/PostPrismaRepository";
import { UserPrismaRepository } from "@infrastructure/persistence/repositories/user/impls/UserPrismaRepository";

const container = new Container();

// Binding prisma client
container.bind<PrismaClient>(TYPES.PrismaClient).toConstantValue(prismaClient);

container.bind(TYPES.RedisClient).toConstantValue(redisClient);

// Bind logger
container.bind<ILogger>(TYPES.WinstonLogger).to(WinstonLogger);

// Binding repositories
container
  .bind<IPostRepository>(TYPES.PostPrismaRepository)
  .to(PostPrismaRepository);
container
  .bind<IUserRepository>(TYPES.UserPrismaRepository)
  .to(UserPrismaRepository);

// Binding use cases
container
  .bind<IFindPostByIDUseCase>(TYPES.FindPostByIDUseCase)
  .to(FindPostByIDUseCase);
container
  .bind<IRegisterUserUseCase>(TYPES.RegisterUserUseCase)
  .to(RegisterUserUseCase);

export { container };

