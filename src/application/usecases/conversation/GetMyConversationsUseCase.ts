import {
  getConversationAvatar,
  getConversationTitle,
} from "@application/utils";
import {
  ExtendedConversation,
  IConversationResponseDTO,
} from "@domain/dtos/conversation";
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

      const response: IConversationResponseDTO[] = [...value.data].map(
        ({ conversation, participants, messages }) => {
          const currentParticipant = participants.find(
            (participant) => participant.userId === userId
          );

          // Get the corresponding conversation title
          conversation.title =
            conversation.title ||
            getConversationTitle({
              currentParticipant,
              allParticipants: participants,
            });

          const defaultGroupAvatars = getConversationAvatar({
            currentParticipant: currentParticipant.userId,
            allParticipants: participants,
            customGroupAvatar: conversation.groupAvatar,
          });

          const extendedConversation = new ExtendedConversation(
            conversation,
            defaultGroupAvatars
          );

          return {
            conversation: extendedConversation,
            participants,
            messages,
          };
        }
      );

      return { data: { data: response }, error: null };
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
