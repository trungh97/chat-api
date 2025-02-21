// Define types
export const TYPES = {
  // REPOSITORIES
  PostPrismaRepository: Symbol.for("PostPrismaRepository"),
  UserPrismaRepository: Symbol.for("UserPrismaRepository"),
  UserRedisRepository: Symbol.for("UserRedisRepository"),
  ConversationPrismaRepository: Symbol.for("ConversationPrismaRepository"),
  ContactPrismaRepository: Symbol.for("ContactPrismaRepository"),

  /* USE CASES DEFINITION - BEGIN*/

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
  GetAllConversationsUseCase: Symbol.for("GetAllConversationsUseCase"),
  CreateConversationUseCase: Symbol.for("CreateConversationUseCase"),
  DeleteConversationUseCase: Symbol.for("DeleteConversationUseCase"),
  FindConversationByIdUseCase: Symbol.for("FindConversationByIdUseCase"),

  /* Contact */
  CreateContactUseCase: Symbol.for("CreateContactUseCase"),
  GetContactsByUserIdUseCase: Symbol.for("GetContactsByUserIdUseCase"),
  FindContactByIdUseCase: Symbol.for("FindContactByIdUseCase"),
  DeleteContactUseCase: Symbol.for("DeleteContactUseCase"),

  /* USE CASES DEFINITION - END */

  // OTHERS
  PrismaClient: Symbol.for("PrismaClient"),
  WinstonLogger: Symbol.for("WinstonLogger"),
  RedisClient: Symbol.for("RedisClient"),
  OAuth2Client: Symbol.for("OAuth2Client"),
};
