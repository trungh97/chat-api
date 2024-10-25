import { PostDTO } from "@shared/dtos";
import { UseCaseResponse } from "@shared/responses";

export interface IFindPostByIDUseCase {
  /**
   * Executes the find post by id use case.
   *
   * @async
   * @param {string} id - The post id
   * @returns {Promise<Result<PostDTO, Error>>} The response data
   */
  execute(id: string): Promise<UseCaseResponse<PostDTO>>;
}
