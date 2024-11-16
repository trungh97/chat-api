import { PrismaClient } from "@prisma/client";
import { Container } from "inversify";
import "reflect-metadata";
import { TYPES } from "./types";

import { FindPostByIDUseCase } from "@application/usecases/post";
import { GetUserByIdUsecase } from "@application/usecases/user";
import { RegisterCredentialBasedUserUseCase } from "@application/usecases/user/credential-based";
import { LoginGoogleUserUseCase } from "@application/usecases/user/federated-credential/LoginGoogleUserUseCase";
import { IPostRepository, IUserRepository } from "@domain/repositories";
import { IFindPostByIDUseCase } from "@domain/usecases/post";
import { IGetUserByIdUsecase } from "@domain/usecases/user";
import { IRegisterCredentialBasedUserUseCase } from "@domain/usecases/user/credential-based";
import { ILoginGoogleUserUseCase } from "@domain/usecases/user/federated-credential";
import { googleOAuth2Client } from "@infrastructure/external/auth/google";
import { prismaClient } from "@infrastructure/persistence/databases/mysql/connection";
import { redisClient } from "@infrastructure/persistence/databases/redis/connection";
import { PostPrismaRepository } from "@infrastructure/persistence/repositories/post/PostPrismaRepository";
import { UserPrismaRepository } from "@infrastructure/persistence/repositories/user";
import { IUserRedisRepository, UserRedisRepository } from "@infrastructure/persistence/repositories/user/UserRedisRepository";
import { ILogger, WinstonLogger } from "@shared/logger";

const container = new Container();

container.bind<PrismaClient>(TYPES.PrismaClient).toConstantValue(prismaClient);

container.bind(TYPES.RedisClient).toConstantValue(redisClient);

container.bind(TYPES.OAuth2Client).toConstantValue(googleOAuth2Client);

// Bind logger
container.bind<ILogger>(TYPES.WinstonLogger).to(WinstonLogger);

// Binding repositories
container
  .bind<IPostRepository>(TYPES.PostPrismaRepository)
  .to(PostPrismaRepository);
container
  .bind<IUserRepository>(TYPES.UserPrismaRepository)
  .to(UserPrismaRepository);
container
  .bind<IUserRedisRepository>(TYPES.UserRedisRepository)
  .to(UserRedisRepository);

// Binding use cases
container
  .bind<IFindPostByIDUseCase>(TYPES.FindPostByIDUseCase)
  .to(FindPostByIDUseCase);
container
  .bind<IRegisterCredentialBasedUserUseCase>(
    TYPES.RegisterCredentialBasedUserUseCase
  )
  .to(RegisterCredentialBasedUserUseCase);
container
  .bind<IGetUserByIdUsecase>(TYPES.GetUserByIdUseCase)
  .to(GetUserByIdUsecase);
container
  .bind<ILoginGoogleUserUseCase>(TYPES.LoginGoogleUserUseCase)
  .to(LoginGoogleUserUseCase);

export { container };

