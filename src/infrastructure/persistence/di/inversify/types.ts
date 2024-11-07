import { UserPrismaRepository } from "@infrastructure/persistence/repositories/user/impls/UserPrismaRepository";

// Define types
export const TYPES = {
  // REPOSITORIES
  PostPrismaRepository: Symbol.for("PostPrismaRepository"),
  UserPrismaRepository: Symbol.for("UserPrismaRepository"),

  /* USE CASES DEFINITION - BEGIN*/

  /* Post */
  FindPostByIDUseCase: Symbol.for("FindPostByIDUseCase"),

  /* User */
  RegisterUserUseCase: Symbol.for("RegisterUserUseCase"),

  /* USE CASES DEFINITION - END */

  // OTHERS
  PrismaClient: Symbol.for("PrismaClient"),
  WinstonLogger: Symbol.for("WinstonLogger"),
  RedisClient: Symbol.for("RedisClient"),
};
