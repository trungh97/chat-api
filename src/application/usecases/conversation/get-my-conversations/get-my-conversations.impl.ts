import { ConversationUseCaseMapper } from "@application/usecases/dtos";
import { getConversationAvatar } from "@application/utils";
import { IConversationRepository } from "@domain/repositories";
import { ConversationTitleService } from "@domain/services";
import { TYPES } from "@infrastructure/external/di/inversify/types";
import { ILogger } from "@shared/logger";
import { inject, injectable } from "inversify";
import { ConversationUseCaseResponse } from "../types";
import { GetMyConversationsRequest } from "./get-my-conversations.request";
import { GetMyConversationsResponse } from "./get-my-conversations.response";
import { IGetMyConversationsUsecase } from "./get-my-conversations.usecase";

@injectable()
export class GetMyConversationsUseCase implements IGetMyConversationsUsecase {
  constructor(
    @inject(TYPES.ConversationRepository)
    private conversationRepository: IConversationRepository,
    @inject(TYPES.WinstonLogger) private logger: ILogger,
    @inject(TYPES.ConversationTitleService)
    private conversationTitleService: ConversationTitleService
  ) {}
  async execute({
    userId,
    pagination,
  }: GetMyConversationsRequest): Promise<GetMyConversationsResponse> {
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

          const conversationTitle =
            this.conversationTitleService.buildConversationTitle({
              currentParticipant: {
                id: currentParticipant.userId,
                customTitle: currentParticipant.customTitle,
              },
              participantList: participants,
            });

          conversation.title = conversation.title || conversationTitle;

          const defaultGroupAvatars = getConversationAvatar({
            currentParticipant: currentParticipant.userId,
            allParticipants: participants,
            customGroupAvatar: conversation.groupAvatar,
          });

          return {
            conversation:
              ConversationUseCaseMapper.fromEntityToDetailUseCaseDTO(
                conversation,
                defaultGroupAvatars
              ),
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
