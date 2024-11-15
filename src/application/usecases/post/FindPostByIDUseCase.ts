import { inject, injectable } from "inversify";
import { Post } from "@domain/entities";
import { IPostRepository } from "@domain/repositories";
import { IFindPostByIDUseCase } from "@domain/usecases/post";
import { UseCaseResponse } from "@shared/responses";
import { TYPES } from "@infrastructure/external/di/inversify";
import { ILogger } from "@shared/logger";

@injectable()
export class FindPostByIDUseCase implements IFindPostByIDUseCase {
  constructor(
    @inject(TYPES.PostPrismaRepository) private postRepository: IPostRepository,
    @inject(TYPES.WinstonLogger) private logger: ILogger
  ) {}

  /**
   * Executes the find post by id use case.
   *
   * @async
   * @param {string} id - The post id
   * @returns {Promise<UseCaseResponse<Post>>} The response data
   */
  async execute(id: string): Promise<UseCaseResponse<Post>> {
    this.logger.info(`Executing FindPostByIDUseCase with id ${id}...`);
    const result = await this.postRepository.findById(id);

    if (result.error) {
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
