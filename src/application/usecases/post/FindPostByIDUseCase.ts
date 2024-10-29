import { inject, injectable } from "inversify";
import { Post } from "@domain/entities";
import { IPostRepository } from "@domain/repositories";
import { IFindPostByIDUseCase } from "@domain/usecases/post";
import { UseCaseResponse } from "@shared/responses";
import { TYPES } from "@infrastructure/persistence/di/inversify";
import { ILogger } from "@infrastructure/persistence/logger";

@injectable()
export class FindPostByIDUseCase implements IFindPostByIDUseCase {
  constructor(
    @inject(TYPES.PostRepositoryPrisma) private postRepository: IPostRepository,
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
    this.logger.info(
      "FindPostByIDUseCase",
      `Executing FindPostByIDUseCase with id ${id}...`
    );
    const result = await this.postRepository.findById<Post, Error>(id);

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
