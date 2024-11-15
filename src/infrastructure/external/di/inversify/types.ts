// Define types
export const TYPES = {
  // REPOSITORIES
  PostPrismaRepository: Symbol.for("PostPrismaRepository"),
  UserPrismaRepository: Symbol.for("UserPrismaRepository"),

  /* USE CASES DEFINITION - BEGIN*/

  /* Post */
  FindPostByIDUseCase: Symbol.for("FindPostByIDUseCase"),

  /* User */
  RegisterCredentialBasedUserUseCase: Symbol.for("RegisterUserCredentialBasedUseCase"),
  GetUserByIdUseCase: Symbol.for("GetUserByIdUseCase"),

  /* USE CASES DEFINITION - END */

  // OTHERS
  PrismaClient: Symbol.for("PrismaClient"),
  WinstonLogger: Symbol.for("WinstonLogger"),
  RedisClient: Symbol.for("RedisClient"),
};
