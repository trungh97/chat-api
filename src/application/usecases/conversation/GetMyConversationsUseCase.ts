import { getConversationTitle } from "@application/utils";
import { IConversationResponseDTO } from "@domain/dtos/conversation";
import { ParticipantWithNameDTO } from "@domain/dtos/participant";
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
  ): Promise<
    UseCaseResponse<ICursorBasedPaginationResponse<IConversationResponseDTO>>
  > {
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

      // Get the corresponding conversation title
      for (const { conversation, participants } of value.data) {
        if (!conversation.title) {
          const currentUser = participants.find(
            (participant) => participant.userId === userId
          );

          conversation.title = getConversationTitle({
            currentParticipant: currentUser,
            allParticipants: participants as ParticipantWithNameDTO[],
          });
        }
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
