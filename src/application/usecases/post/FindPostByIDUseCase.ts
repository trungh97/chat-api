import { IPostRepository } from "@domain/repositories";
import { IFindPostByIDUseCase } from "@domain/usecases/post";
import { PostDTO } from "@shared/dtos";
import { UseCaseResponse } from "@shared/responses";

export class FindPostByIDUseCase implements IFindPostByIDUseCase {
  constructor(private postRepository: IPostRepository) {}

  /**
   * Executes the find post by id use case.
   *
   * @async
   * @param {string} id - The post id
   * @returns {Promise<UseCaseResponse<PostDTO>>} The response data
   */
  async execute(id: string): Promise<UseCaseResponse<PostDTO>> {
    const result = await this.postRepository.findById<PostDTO, Error>(id);

    if (!result.success) {
      return {
        data: null,
        error: result.error.message,
      };
    }

    return {
      data: result.value,
    };
  }
}
