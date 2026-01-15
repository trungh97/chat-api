import { PrismaClient } from "@prisma/client";
import { Container } from "inversify";
import "reflect-metadata";
import { TYPES } from "./types";

import {
  CreateContactUseCase,
  DeleteContactUseCase,
  FindContactByIdUseCase,
  GetContactsByUserIdUseCase,
  ICreateContactUseCase,
  IDeleteContactUseCase,
  IFindContactByIdUseCase,
  IGetContactsByUserIdUseCase,
} from "@application/usecases/contact";
import {
  CreateConversationUseCase,
  DeleteConversationUseCase,
  FindConversationByIdUseCase,
  GetMyConversationsUseCase,
  ICreateConversationUsecase,
  IDeleteConversationUsecase,
  IFindConversationByIdUseCase,
  IGetMyConversationsUsecase,
} from "@application/usecases/conversation";
import {
  ChangeFriendRequestStatusUseCase,
  CreateFriendRequestUseCase,
  DeleteExpiredFriendRequestsUseCase,
  DeleteFriendRequestUseCase,
  GetFriendRequestByIdUseCase,
  GetFriendRequestByUsersUseCase,
  GetFriendRequestsByUserIdUseCase,
  IChangeFriendRequestStatusUseCase,
  ICreateFriendRequestUseCase,
  IDeleteExpiredFriendRequestsUseCase,
  IDeleteFriendRequestUseCase,
  IGetFriendRequestByIdUseCase,
  IGetFriendRequestByUsersUseCase,
  IGetFriendRequestsByUserIdUseCase,
} from "@application/usecases/friend-request";
import {
  CreateMessageUseCase,
  CreateSystemMessageUseCase,
  DeleteMessageUseCase,
  GetMessageByIdUseCase,
  GetMessagesByConversationIdUseCase,
  ICreateMessageUseCase,
  ICreateSystemMessageUseCase,
  IDeleteMessageUseCase,
  IGetMessageByIdUseCase,
  IGetMessagesByConversationIdUseCase,
  IUpdateMessageStatusUseCase,
  IUpdateMessageUseCase,
  UpdateMessageStatusUseCase,
  UpdateMessageUseCase,
} from "@application/usecases/message";
import {
  AddParticipantAndNotifyUseCase,
  BatchUpdateLastReceivedMessagesUseCase,
  FindAndBatchUpdateLastReceivedMessageUseCase,
  GetParticipantsByConversationIdUseCase,
  IAddingParticipantAndNotifyUseCase,
  IBatchUpdateLastReceivedMessagesUseCase,
  IFindAndBatchUpdateLastReceivedMessageUseCase,
  IGetParticipantsByConversationIdUseCase,
  IUpdateParticipantLastReceivedMessageUseCase,
  IUpdateParticipantLastSeenMessageUseCase,
  UpdateParticipantLastReceivedMessageUseCase,
  UpdateParticipantLastSeenMessageUseCase,
} from "@application/usecases/participant";
import {
  GetUserByIdUsecase,
  IGetUserByIdUsecase,
} from "@application/usecases/user";
import {
  ILoginCredentialBasedUserUseCase,
  LoginCredentialBasedUserUseCase,
} from "@application/usecases/user/credential-based/login-user";
import {
  IRegisterCredentialBasedUserUseCase,
  RegisterCredentialBasedUserUseCase,
} from "@application/usecases/user/credential-based/register-user";
import {
  ILoginGoogleUserUseCase,
  LoginGoogleUserUseCase,
} from "@application/usecases/user/federated-credential/login-google-user";
import { IMessageEventPublisher } from "@domain/events";
import { IMessageQueueProducer } from "@domain/queue";
import {
  IContactRepository,
  IConversationRepository,
  IFriendRequestRepository,
  IMessageRepository,
  IParticipantRepository,
  IUserRepository,
} from "@domain/repositories";
import {
  ConversationTitleService,
  IConversationTitleService,
} from "@domain/services";
import { googleOAuth2Client } from "@infrastructure/external/auth/google";
import { prismaClient } from "@infrastructure/persistence/databases/mysql/connection";
import { redisClient } from "@infrastructure/persistence/databases/redis/connection";
import {
  MessageQueueProducer,
  MessageQueueWorker,
} from "@infrastructure/persistence/queue/bullmq";
import { ContactPrismaRepository } from "@infrastructure/persistence/repositories/contact";
import { ConversationPrismaRepository } from "@infrastructure/persistence/repositories/conversation";
import { FriendRequestPrismaRepository } from "@infrastructure/persistence/repositories/friendRequest";
import { MessagePrismaRepository } from "@infrastructure/persistence/repositories/message";
import { ParticipantPrismaRepository } from "@infrastructure/persistence/repositories/participant";
import { UserPrismaRepository } from "@infrastructure/persistence/repositories/user";
import {
  IUserRedisRepository,
  UserRedisRepository,
} from "@infrastructure/persistence/repositories/user/UserRedisRepository";
import { RedisMessagePublisher } from "@infrastructure/persistence/websocket/redis-pubsub";
import { ILogger, WinstonLogger } from "@shared/logger";

const container = new Container();

container.bind<PrismaClient>(TYPES.PrismaClient).toConstantValue(prismaClient);

container.bind(TYPES.RedisClient).toConstantValue(redisClient);

container.bind(TYPES.OAuth2Client).toConstantValue(googleOAuth2Client);

container
  .bind<ILogger>(TYPES.WinstonLogger)
  .to(WinstonLogger)
  .inSingletonScope();

/** -------------- USER REPOSITORIES --------------- */
container.bind<IUserRepository>(TYPES.UserRepository).to(UserPrismaRepository);
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
  .bind<IConversationRepository>(TYPES.ConversationRepository)
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
  .bind<IFriendRequestRepository>(TYPES.FriendRequestRepository)
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
  .bind<IMessageRepository>(TYPES.MessageRepository)
  .to(MessagePrismaRepository);

/** -------------- MESSAGE USECASES --------------- */
container
  .bind<ICreateMessageUseCase>(TYPES.CreateMessageUseCase)
  .to(CreateMessageUseCase);
container
  .bind<ICreateSystemMessageUseCase>(TYPES.CreateSystemMessageUseCase)
  .to(CreateSystemMessageUseCase);
container
  .bind<IGetMessagesByConversationIdUseCase>(
    TYPES.GetMessagesByConversationIdUseCase
  )
  .to(GetMessagesByConversationIdUseCase);
container
  .bind<IGetMessageByIdUseCase>(TYPES.GetMessageByIdUseCase)
  .to(GetMessageByIdUseCase);
container
  .bind<IUpdateMessageUseCase>(TYPES.UpdateMessageUseCase)
  .to(UpdateMessageUseCase);
container
  .bind<IUpdateMessageStatusUseCase>(TYPES.UpdateMessageStatusUseCase)
  .to(UpdateMessageStatusUseCase);
container
  .bind<IDeleteMessageUseCase>(TYPES.DeleteMessageUseCase)
  .to(DeleteMessageUseCase);

/** -------------- PARTICIPANT REPOSITORIES --------------- */
container
  .bind<IParticipantRepository>(TYPES.ParticipantRepository)
  .to(ParticipantPrismaRepository);

/** -------------- PARTICIPANT USECASES --------------- */
container
  .bind<IAddingParticipantAndNotifyUseCase>(
    TYPES.AddParticipantAndNotifyUseCase
  )
  .to(AddParticipantAndNotifyUseCase);
container
  .bind<IGetParticipantsByConversationIdUseCase>(
    TYPES.GetParticipantsByConversationIdUseCase
  )
  .to(GetParticipantsByConversationIdUseCase);
container
  .bind<IUpdateParticipantLastSeenMessageUseCase>(
    TYPES.UpdateParticipantLastSeenMessageUseCase
  )
  .to(UpdateParticipantLastSeenMessageUseCase);
container
  .bind<IUpdateParticipantLastReceivedMessageUseCase>(
    TYPES.UpdateParticipantLastReceivedMessageUseCase
  )
  .to(UpdateParticipantLastReceivedMessageUseCase);
container
  .bind<IBatchUpdateLastReceivedMessagesUseCase>(
    TYPES.BatchUpdateLastReceivedMessagesUseCase
  )
  .to(BatchUpdateLastReceivedMessagesUseCase);
container
  .bind<IFindAndBatchUpdateLastReceivedMessageUseCase>(
    TYPES.FindAndBatchUpdateLastReceivedMessageUseCase
  )
  .to(FindAndBatchUpdateLastReceivedMessageUseCase);

/** -------------- CONTACT REPOSITORIES --------------- */
container
  .bind<IContactRepository>(TYPES.ContactRepository)
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

/** -------------- PUBLISHERS --------------- */
container
  .bind<IMessageEventPublisher>(TYPES.MessagePublisher)
  .to(RedisMessagePublisher);

/** -------------- QUEUE --------------- */
container
  .bind<IMessageQueueProducer>(TYPES.MessageQueue)
  .to(MessageQueueProducer);
container
  .bind(TYPES.MessageQueueWorker)
  .to(MessageQueueWorker)
  .inSingletonScope();

/** -------------- SERVICES --------------- */
container
  .bind<IConversationTitleService>(TYPES.ConversationTitleService)
  .to(ConversationTitleService);

export { container };

