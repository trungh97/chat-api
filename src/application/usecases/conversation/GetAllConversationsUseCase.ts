import { inject, injectable } from "inversify";
import { IConversationRepository } from "@domain/repositories";
import { TYPES } from "@infrastructure/external/di/inversify";
import { UseCaseResponse } from "@shared/responses";
import { Conversation } from "@domain/entities";
import { IGetAllConversationsUsecase } from "@domain/usecases/conversation";
import { PAGE_LIMIT } from "@shared/constants";
import {
  ICursorBasedPaginationParams,
  ICursorBasedPaginationResponse,
} from "@domain/interfaces/pagination/CursorBasedPagination";
import { ILogger } from "@shared/logger";

@injectable()
class GetAllConversationsUseCase implements IGetAllConversationsUsecase {
  constructor(
    @inject(TYPES.ConversationPrismaRepository)
    private conversationRepository: IConversationRepository,
    @inject(TYPES.WinstonLogger) private logger: ILogger
  ) {}
  async execute(
    params: ICursorBasedPaginationParams
  ): Promise<UseCaseResponse<ICursorBasedPaginationResponse<Conversation>>> {
    try {
      const { cursor, limit = PAGE_LIMIT } = params;
      const { value, error } =
        await this.conversationRepository.getAllConversations(cursor, limit);
        console.log(value, error);

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

export { GetAllConversationsUseCase };
