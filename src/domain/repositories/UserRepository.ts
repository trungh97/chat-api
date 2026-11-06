import { User } from "@domain/entities";
import {
  ICursorBasedPaginationParams,
  ICursorBasedPaginationResponse,
} from "@domain/interfaces/pagination/CursorBasedPagination";
import { RepositoryResponse } from "@shared/responses";

export interface IUserRepository {
  /**
   * Retrieves the user's information based on the user id.
   *
   * @async
   * @param {string} id - The user id.
   * @returns {Promise<RepositoryResponse<User, Error>>} The user's information.
   */
  getUserById(id: string): Promise<RepositoryResponse<User, Error>>;

  /**
   * Retrieves the user's information based on the user email.
   *
   * @async
   * @param {string} email - The user email.
   * @returns {Promise<RepositoryResponse<User, Error>>} The user's information.
   */
  findUserByEmail(email: string): Promise<RepositoryResponse<User, Error>>;

  /**
   * Create a new credential based user.
   *
   * @async
   * @param {User} user - The new user.
   * @returns {Promise<RepositoryResponse<User, Error>>} The new user.
   */
  createCredentialBasedUser(
    user: User
  ): Promise<RepositoryResponse<User, Error>>;

  /**
   * Create a new federated credential user.
   *
   * @async
   * @param {User} user - The new user.
   * @returns {Promise<RepositoryResponse<User, Error>>} The new user.
   */
  createFederatedCredentialUser(
    user: User
  ): Promise<RepositoryResponse<User, Error>>;

  /**
   * Retrieves the credential based user's information based on the user id.
   *
   * @async
   * @param {string} id - The user id.
   * @returns {Promise<RepositoryResponse<User, Error>>} The user's information.
   */
  getCredentialBasedUserById(
    id: string
  ): Promise<RepositoryResponse<User, Error>>;

  /**
   * Retrieves the federated credential user's information based on the user id.
   *
   * @async
   * @param {string} id - The user id.
   * @returns {Promise<RepositoryResponse<User, Error>>} The user's information.
   */
  getFederatedCredentialUserById(
    id: string
  ): Promise<RepositoryResponse<User, Error>>;

  /**
   * Retrieves the user names with the given IDs.
   *
   * @param {string[]} userIds - An array of unique identifiers of the users.
   * @returns {Promise<RepositoryResponse<string[], Error>>} A promise resolving to an array of names of the users.
   */
  getUserNamesByIds(userIds: string[]): Promise<
    RepositoryResponse<
      {
        id: string;
        firstName: string;
        lastName: string;
      }[],
      Error
    >
  >;

  /**
   * Updates the last seen at time for a user.
   *
   * @param userId - The unique identifier of the user.
   * @param lastSeenAt - The date and time when the user was last seen.
   * @returns A promise resolving to a boolean indicating if the update was successful.
   */
  updateUserLastSeenAt(
    userId: string,
    lastSeenAt: Date
  ): Promise<RepositoryResponse<boolean, Error>>;

  /**
   * Locks two user rows until the current transaction ends (`SELECT ... FOR UPDATE`), in
   * id order. Call it inside `ITransactionManager.run` to serialize work on a user pair;
   * outside a transaction it returns an error instead of locking.
   *
   * @returns The ids of the users that exist (an unknown id is not returned).
   */
  lockUsersForUpdate(
    firstUserId: string,
    secondUserId: string
  ): Promise<RepositoryResponse<string[], Error>>;

  /**
   * Searches active users by first name, last name or email, excluding one user.
   * Results are ordered by first name, last name, then id. The cursor is the id of
   * the last user on the previous page.
   *
   * @param params.excludeUserId - The user to leave out (usually the caller).
   * @param params.search - Optional text matched against first name, last name and email.
   * @param params.pagination - The page size and the cursor.
   */
  searchUsers(params: {
    excludeUserId: string;
    search?: string;
    pagination: ICursorBasedPaginationParams;
  }): Promise<RepositoryResponse<ICursorBasedPaginationResponse<User>, Error>>;
}
