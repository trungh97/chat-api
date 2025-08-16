// Define types
export const TYPES = {
  // REPOSITORIES
  PostPrismaRepository: Symbol.for("PostPrismaRepository"),
  UserPrismaRepository: Symbol.for("UserPrismaRepository"),
  UserRedisRepository: Symbol.for("UserRedisRepository"),
  ConversationPrismaRepository: Symbol.for("ConversationPrismaRepository"),
  ContactPrismaRepository: Symbol.for("ContactPrismaRepository"),
  FriendRequestPrismaRepository: Symbol.for("FriendRequestPrismaRepository"),
  MessagePrismaRepository: Symbol.for("MessagePrismaRepository"),
  ParticipantPrismaRepository: Symbol.for("ParticipantPrismaRepository"),

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
  DeleteMessageUseCase: Symbol.for("DeleteMessageUseCase"),
  GetMessagesByConversationIdUseCase: Symbol.for(
    "GetMessagesByConversationIdUseCase"
  ),

  /* Participant */
  AddParticipantAndNotifyUseCase: Symbol.for("AddParticipantAndNotifyUseCase"),

  /* USE CASES DEFINITION - END */

  /* SERVICES */
  ConversationTitleService: Symbol.for("ConversationTitleService"),

  // OTHERS
  PrismaClient: Symbol.for("PrismaClient"),
  WinstonLogger: Symbol.for("WinstonLogger"),
  RedisClient: Symbol.for("RedisClient"),
  OAuth2Client: Symbol.for("OAuth2Client"),
};
