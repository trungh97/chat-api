// Define types
export const TYPES = {
  // REPOSITORIES
  PostPrismaRepository: Symbol.for("PostPrismaRepository"),
  UserPrismaRepository: Symbol.for("UserPrismaRepository"),
  UserRedisRepository: Symbol.for("UserRedisRepository"),

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

  /* USE CASES DEFINITION - END */

  // OTHERS
  PrismaClient: Symbol.for("PrismaClient"),
  WinstonLogger: Symbol.for("WinstonLogger"),
  RedisClient: Symbol.for("RedisClient"),
  OAuth2Client: Symbol.for("OAuth2Client"),
};
