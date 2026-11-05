import { SearchUsersRequest } from "./search-users.request";
import { SearchUsersResponse } from "./search-users.response";

export interface ISearchUsersUseCase {
  /**
   * Lists active users other than the caller, optionally filtered by name or email,
   * ordered by name, with each user's online status.
   */
  execute(request: SearchUsersRequest): Promise<SearchUsersResponse>;
}
