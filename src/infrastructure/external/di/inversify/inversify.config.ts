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
  GetMyConversationsUseCase,
} from "@application/usecases/conversation";
import {
  ChangeFriendRequestStatusUseCase,
  CreateFriendRequestUseCase,
  DeleteExpiredFriendRequestsUseCase,
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
  IMessageRepository,
  IParticipantRepository,
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
  IGetMyConversationsUsecase,
} from "@domain/usecases/conversation";
import {
  IChangeFriendRequestStatusUseCase,
  ICreateFriendRequestUseCase,
  IDeleteFriendRequestUseCase,
  IDeleteExpiredFriendRequestsUseCase,
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
import { MessagePrismaRepository } from "@infrastructure/persistence/repositories/message";
import {
  ICreateMessageUseCase,
  ICreateSystemMessageUseCase,
} from "@domain/usecases/message";
import {
  CreateMessageUseCase,
  CreateSystemMessageUseCase,
} from "@application/usecases/message";
import { ParticipantPrismaRepository } from "@infrastructure/persistence/repositories/participant";
import { IAddingParticipantAndNotifyUseCase } from "@domain/usecases/participant";
import { AddParticipantAndNotifyUseCase } from "@application/usecases/participant";

const container = new Container();

container.bind<PrismaClient>(TYPES.PrismaClient).toConstantValue(prismaClient);

container.bind(TYPES.RedisClient).toConstantValue(redisClient);

container.bind(TYPES.OAuth2Client).toConstantValue(googleOAuth2Client);

container
  .bind<ILogger>(TYPES.WinstonLogger)
  .to(WinstonLogger)
  .inSingletonScope();

/** -------------- USER REPOSITORIES --------------- */
container
  .bind<IUserRepository>(TYPES.UserPrismaRepository)
  .to(UserPrismaRepository);
container
  .bind<IUserRedisRepository>(TYPES.UserRedisRepository)
  .to(UserRedisRepository);

/** -------------- USER USECASES --------------- */
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

/** -------------- CONVERSATION REPOSITORIES --------------- */
container
  .bind<IConversationRepository>(TYPES.ConversationPrismaRepository)
  .to(ConversationPrismaRepository);

/** -------------- CONVERSATION USECASES --------------- */
container
  .bind<IGetMyConversationsUsecase>(TYPES.GetMyConversationsUseCase)
  .to(GetMyConversationsUseCase);
container
  .bind<ICreateConversationUsecase>(TYPES.CreateConversationUseCase)
  .to(CreateConversationUseCase);
container
  .bind<IDeleteConversationUsecase>(TYPES.DeleteConversationUseCase)
  .to(DeleteConversationUseCase);
container
  .bind<IFindConversationByIdUseCase>(TYPES.FindConversationByIdUseCase)
  .to(FindConversationByIdUseCase);

/** -------------- FRIEND REQUEST REPOSITORIES --------------- */
container
  .bind<IFriendRequestRepository>(TYPES.FriendRequestPrismaRepository)
  .to(FriendRequestPrismaRepository);

/** -------------- FRIEND REQUEST USECASES --------------- */
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
container
  .bind<IDeleteExpiredFriendRequestsUseCase>(
    TYPES.DeleteExpiredFriendRequestsUseCase
  )
  .to(DeleteExpiredFriendRequestsUseCase);

/** -------------- MESSAGE REPOSITORIES --------------- */
container
  .bind<IMessageRepository>(TYPES.MessagePrismaRepository)
  .to(MessagePrismaRepository);

/** -------------- MESSAGE USECASES --------------- */
container
  .bind<ICreateMessageUseCase>(TYPES.CreateMessageUseCase)
  .to(CreateMessageUseCase);
container
  .bind<ICreateSystemMessageUseCase>(TYPES.CreateSystemMessageUseCase)
  .to(CreateSystemMessageUseCase);

/** -------------- PARTICIPANT REPOSITORIES --------------- */
container
  .bind<IParticipantRepository>(TYPES.ParticipantPrismaRepository)
  .to(ParticipantPrismaRepository);

/** -------------- PARTICIPANT USECASES --------------- */
container
  .bind<IAddingParticipantAndNotifyUseCase>(
    TYPES.AddParticipantAndNotifyUseCase
  )
  .to(AddParticipantAndNotifyUseCase);

/** -------------- CONTACT REPOSITORIES --------------- */
container
  .bind<IContactRepository>(TYPES.ContactPrismaRepository)
  .to(ContactPrismaRepository);

/** -------------- CONTACT USECASES --------------- */
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

/** -------------- POST REPOSITORIES --------------- */
container
  .bind<IPostRepository>(TYPES.PostPrismaRepository)
  .to(PostPrismaRepository);

/** -------------- POST USECASES --------------- */
container
  .bind<IFindPostByIDUseCase>(TYPES.FindPostByIDUseCase)
  .to(FindPostByIDUseCase);

export { container };
