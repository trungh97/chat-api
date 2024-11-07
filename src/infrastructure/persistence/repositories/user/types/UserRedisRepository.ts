import { User } from "@domain/entities";
import { RepositoryResponse } from "@shared/responses";

export interface IUserRedisRepository {
  getMe(): Promise<RepositoryResponse<User, Error>>;
  saveUser(user: User): Promise<RepositoryResponse<User, Error>>;
}
