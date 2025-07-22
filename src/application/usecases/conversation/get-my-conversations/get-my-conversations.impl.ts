import {
  getConversationAvatar,
  getConversationTitle,
} from "@application/utils";
import {
  ICursorBasedPaginationParams
} from "@domain/interfaces/pagination/CursorBasedPagination";
import { IConversationRepository } from "@domain/repositories";
import { TYPES } from "@infrastructure/external/di/inversify";
import { ILogger } from "@shared/logger";
import { inject, injectable } from "inversify";
import { ConversationUseCaseResponse, ExtendedConversation } from "../types";
import { GetMyConversationsResponse } from "./get-my-conversations.response";
import { IGetMyConversationsUsecase } from "./get-my-conversations.usecase";

@injectable()
export class GetMyConversationsUseCase implements IGetMyConversationsUsecase {
  constructor(
    @inject(TYPES.ConversationPrismaRepository)
    private conversationRepository: IConversationRepository,
    @inject(TYPES.WinstonLogger) private logger: ILogger
  ) {}
  async execute(
    userId: string,
    pagination: ICursorBasedPaginationParams
  ): Promise<GetMyConversationsResponse> {
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

      const response: ConversationUseCaseResponse[] = [...value.data].map(
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

      return {
        data: { data: response, nextCursor: value.nextCursor },
        error: null,
      };
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
