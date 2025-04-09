import { Conversation } from "@domain/entities";
import {
  ICursorBasedPaginationParams,
  ICursorBasedPaginationResponse,
} from "@domain/interfaces/pagination/CursorBasedPagination";
import { IConversationRepository } from "@domain/repositories";
import { IGetMyConversationsUsecase } from "@domain/usecases/conversation";
import { TYPES } from "@infrastructure/external/di/inversify";
import { ILogger } from "@shared/logger";
import { UseCaseResponse } from "@shared/responses";
import { inject, injectable } from "inversify";

@injectable()
class GetMyConversationsUseCase implements IGetMyConversationsUsecase {
  constructor(
    @inject(TYPES.ConversationPrismaRepository)
    private conversationRepository: IConversationRepository,
    @inject(TYPES.WinstonLogger) private logger: ILogger
  ) {}
  async execute(
    userId: string,
    pagination: ICursorBasedPaginationParams
  ): Promise<UseCaseResponse<ICursorBasedPaginationResponse<Conversation>>> {
    try {
      const { value, error } =
        await this.conversationRepository.getMyConversations(
          userId,
          pagination
        );

      if (error) {
        this.logger.error(error.message);
        return {
          data: {
            data: [],
            nextCursor: undefined,
          },
          error: error.message,
        };
      }

      return { data: value, error: null };
    } catch (error) {
      this.logger.error(error.message);
      return {
        data: {
          data: [],
          nextCursor: undefined,
        },
        error: "Failed to retrieve conversations.",
      };
    }
  }
}

export { GetMyConversationsUseCase };
