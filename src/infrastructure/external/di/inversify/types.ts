// Define types
export const TYPES = {
  // REPOSITORIES
  PostPrismaRepository: Symbol.for("PostPrismaRepository"),
  UserRepository: Symbol.for("UserRepository"),
  UserRedisRepository: Symbol.for("UserRedisRepository"),
  ConversationRepository: Symbol.for("ConversationRepository"),
  ContactRepository: Symbol.for("ContactRepository"),
  FriendRequestRepository: Symbol.for("FriendRequestRepository"),
  MessageRepository: Symbol.for("MessageRepository"),
  ParticipantRepository: Symbol.for("ParticipantRepository"),

  // PUBLISHERS
  MessagePublisher: Symbol.for("MessagePublisher"),

  /* USE CASES DEFINITION - BEGIN */

  /* Post */
  FindPostByIDUseCase: Symbol.for("FindPostByIDUseCase"),

  /* User */
  RegisterCredentialBasedUserUseCase: Symbol.for(
    "RegisterUserCredentialBasedUseCase"
  ),
  GetUserByIdUseCase: Symbol.for("GetUserByIdUseCase"),
  LoginGoogleUserUseCase: Symbol.for("LoginGoogleUserUseCase"),
  LoginCredentialBasedUserUseCase: Symbol.for("LoginUserUseCase"),

  /* Conversation */
  GetMyConversationsUseCase: Symbol.for("GetMyConversationsUseCase"),
  CreateConversationUseCase: Symbol.for("CreateConversationUseCase"),
  DeleteConversationUseCase: Symbol.for("DeleteConversationUseCase"),
  FindConversationByIdUseCase: Symbol.for("FindConversationByIdUseCase"),

  /* Friend Request */
  CreateFriendRequestUseCase: Symbol.for("CreateFriendRequestUseCase"),
  GetFriendRequestsByUserIdUseCase: Symbol.for(
    "GetFriendRequestsByUserIdUseCase"
  ),
  GetFriendRequestByIdUseCase: Symbol.for("GetFriendRequestByIdUseCase"),
  GetFriendRequestByUsersUseCase: Symbol.for("GetFriendRequestByUsersUseCase"),
  DeleteFriendRequestUseCase: Symbol.for("DeleteFriendRequestUseCase"),
  ChangeFriendRequestStatusUseCase: Symbol.for(
    "ChangeFriendRequestStatusUseCase"
  ),
  DeleteExpiredFriendRequestsUseCase: Symbol.for(
    "DeleteExpiredFriendRequestsUseCase"
  ),

  /* Contact */
  CreateContactUseCase: Symbol.for("CreateContactUseCase"),
  GetContactsByUserIdUseCase: Symbol.for("GetContactsByUserIdUseCase"),
  FindContactByIdUseCase: Symbol.for("FindContactByIdUseCase"),
  DeleteContactUseCase: Symbol.for("DeleteContactUseCase"),

  /* Message */
  CreateMessageUseCase: Symbol.for("CreateMessageUseCase"),
  CreateSystemMessageUseCase: Symbol.for("CreateSystemMessageUseCase"),
  GetMessageByIdUseCase: Symbol.for("GetMessageByIdUseCase"),
  GetLastMessageByConversationIdUseCase: Symbol.for(
    "GetLastMessageByConversationIdUseCase"
  ),
  UpdateMessageUseCase: Symbol.for("UpdateMessageUseCase"),
  UpdateMessageStatusUseCase: Symbol.for("UpdateMessageStatusUseCase"),
  DeleteMessageUseCase: Symbol.for("DeleteMessageUseCase"),
  GetMessagesByConversationIdUseCase: Symbol.for(
    "GetMessagesByConversationIdUseCase"
  ),

  /* Participant */
  AddParticipantAndNotifyUseCase: Symbol.for("AddParticipantAndNotifyUseCase"),
  GetParticipantsByConversationIdUseCase: Symbol.for(
    "GetParticipantsByConversationIdUseCase"
  ),

  UpdateParticipantLastSeenMessageUseCase: Symbol.for(
    "UpdateParticipantLastSeenMessageUseCase"
  ),
  UpdateParticipantLastReceivedMessageUseCase: Symbol.for(
    "UpdateParticipantLastReceivedMessageUseCase"
  ),

  /* USE CASES DEFINITION - END */

  /* SERVICES */
  ConversationTitleService: Symbol.for("ConversationTitleService"),

  // OTHERS
  PrismaClient: Symbol.for("PrismaClient"),
  WinstonLogger: Symbol.for("WinstonLogger"),
  RedisClient: Symbol.for("RedisClient"),
  OAuth2Client: Symbol.for("OAuth2Client"),
  MessageQueue: Symbol.for("MessageQueue"),
  MessageQueueWorker: Symbol.for("MessageQueueWorker"),
};
