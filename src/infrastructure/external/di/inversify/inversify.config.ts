import { PrismaClient } from "@prisma/client";
import { Container } from "inversify";
import "reflect-metadata";
import { TYPES } from "./types";

import {
  CreateContactUseCase,
  DeleteContactUseCase,
  FindContactByIdUseCase,
  GetContactsByUserIdUseCase,
} from "@application/usecases/contact";
import {
  CreateConversationUseCase,
  DeleteConversationUseCase,
  FindConversationByIdUseCase,
  GetAllConversationsUseCase,
} from "@application/usecases/conversation";
import {
  ChangeFriendRequestStatusUseCase,
  CreateFriendRequestUseCase,
  DeleteFriendRequestUseCase,
  GetFriendRequestByIdUseCase,
  GetFriendRequestByUsersUseCase,
  GetFriendRequestsByUserIdUseCase,
} from "@application/usecases/friend-request";
import { FindPostByIDUseCase } from "@application/usecases/post";
import { GetUserByIdUsecase } from "@application/usecases/user";
import { RegisterCredentialBasedUserUseCase } from "@application/usecases/user/credential-based";
import { LoginCredentialBasedUserUseCase } from "@application/usecases/user/credential-based/LoginUserUseCase";
import { LoginGoogleUserUseCase } from "@application/usecases/user/federated-credential/LoginGoogleUserUseCase";
import {
  IContactRepository,
  IConversationRepository,
  IFriendRequestRepository,
  IPostRepository,
  IUserRepository,
} from "@domain/repositories";
import {
  ICreateContactUseCase,
  IDeleteContactUseCase,
  IFindContactByIdUseCase,
  IGetContactsByUserIdUseCase,
} from "@domain/usecases/contact";
import {
  ICreateConversationUsecase,
  IDeleteConversationUsecase,
  IFindConversationByIdUseCase,
  IGetAllConversationsUsecase,
} from "@domain/usecases/conversation";
import {
  IChangeFriendRequestStatusUseCase,
  ICreateFriendRequestUseCase,
  IDeleteFriendRequestUseCase,
  IGetFriendRequestByIdUseCase,
  IGetFriendRequestByUsersUseCase,
  IGetFriendRequestsByUserIdUseCase,
} from "@domain/usecases/friend-request";
import { IFindPostByIDUseCase } from "@domain/usecases/post";
import { IGetUserByIdUsecase } from "@domain/usecases/user";
import {
  ILoginCredentialBasedUserUseCase,
  IRegisterCredentialBasedUserUseCase,
} from "@domain/usecases/user/credential-based";
import { ILoginGoogleUserUseCase } from "@domain/usecases/user/federated-credential";
import { googleOAuth2Client } from "@infrastructure/external/auth/google";
import { prismaClient } from "@infrastructure/persistence/databases/mysql/connection";
import { redisClient } from "@infrastructure/persistence/databases/redis/connection";
import { ContactPrismaRepository } from "@infrastructure/persistence/repositories/contact";
import { ConversationPrismaRepository } from "@infrastructure/persistence/repositories/conversation";
import { FriendRequestPrismaRepository } from "@infrastructure/persistence/repositories/friendRequest";
import { PostPrismaRepository } from "@infrastructure/persistence/repositories/post/PostPrismaRepository";
import { UserPrismaRepository } from "@infrastructure/persistence/repositories/user";
import {
  IUserRedisRepository,
  UserRedisRepository,
} from "@infrastructure/persistence/repositories/user/UserRedisRepository";
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
container
  .bind<IConversationRepository>(TYPES.ConversationPrismaRepository)
  .to(ConversationPrismaRepository);
container
  .bind<IContactRepository>(TYPES.ContactPrismaRepository)
  .to(ContactPrismaRepository);
container
  .bind<IFriendRequestRepository>(TYPES.FriendRequestPrismaRepository)
  .to(FriendRequestPrismaRepository);

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
container
  .bind<ILoginCredentialBasedUserUseCase>(TYPES.LoginCredentialBasedUserUseCase)
  .to(LoginCredentialBasedUserUseCase);
container
  .bind<IGetAllConversationsUsecase>(TYPES.GetAllConversationsUseCase)
  .to(GetAllConversationsUseCase);
container
  .bind<ICreateConversationUsecase>(TYPES.CreateConversationUseCase)
  .to(CreateConversationUseCase);
container
  .bind<IDeleteConversationUsecase>(TYPES.DeleteConversationUseCase)
  .to(DeleteConversationUseCase);
container
  .bind<IFindConversationByIdUseCase>(TYPES.FindConversationByIdUseCase)
  .to(FindConversationByIdUseCase);
container
  .bind<IGetContactsByUserIdUseCase>(TYPES.GetContactsByUserIdUseCase)
  .to(GetContactsByUserIdUseCase);
container
  .bind<ICreateContactUseCase>(TYPES.CreateContactUseCase)
  .to(CreateContactUseCase);
container
  .bind<IDeleteContactUseCase>(TYPES.DeleteContactUseCase)
  .to(DeleteContactUseCase);
container
  .bind<IFindContactByIdUseCase>(TYPES.FindContactByIdUseCase)
  .to(FindContactByIdUseCase);
container
  .bind<ICreateFriendRequestUseCase>(TYPES.CreateFriendRequestUseCase)
  .to(CreateFriendRequestUseCase);
container
  .bind<IGetFriendRequestsByUserIdUseCase>(
    TYPES.GetFriendRequestsByUserIdUseCase
  )
  .to(GetFriendRequestsByUserIdUseCase);
container
  .bind<IGetFriendRequestByIdUseCase>(TYPES.GetFriendRequestByIdUseCase)
  .to(GetFriendRequestByIdUseCase);
container
  .bind<IGetFriendRequestByUsersUseCase>(TYPES.GetFriendRequestByUsersUseCase)
  .to(GetFriendRequestByUsersUseCase);
container
  .bind<IDeleteFriendRequestUseCase>(TYPES.DeleteFriendRequestUseCase)
  .to(DeleteFriendRequestUseCase);
container
  .bind<IChangeFriendRequestStatusUseCase>(
    TYPES.ChangeFriendRequestStatusUseCase
  )
  .to(ChangeFriendRequestStatusUseCase);

export { container };

