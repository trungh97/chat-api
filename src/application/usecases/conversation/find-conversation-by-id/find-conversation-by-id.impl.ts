import { ConversationUseCaseMapper } from "@application/usecases/dtos";
import { getConversationAvatar } from "@application/utils";
import { IConversationRepository } from "@domain/repositories";
import { ConversationTitleService } from "@domain/services";
import { TYPES } from "@infrastructure/external/di/inversify/types";
import { inject, injectable } from "inversify";
import { FindConversationByIdRequest } from "./find-conversation-by-id.request";
import { FindConversationByIdResponse } from "./find-conversation-by-id.response";
import { IFindConversationByIdUseCase } from "./find-conversation-by-id.usecase";

@injectable()
export class FindConversationByIdUseCase
  implements IFindConversationByIdUseCase
{
  constructor(
    @inject(TYPES.ConversationPrismaRepository)
    private conversationRepository: IConversationRepository,

    @inject(TYPES.ConversationTitleService)
    private conversationTitleService: ConversationTitleService
  ) {}

  async execute({
    id,
    userId,
  }: FindConversationByIdRequest): Promise<FindConversationByIdResponse> {
    try {
      const result = await this.conversationRepository.getConversationById(id);

      if (result.error) {
        return {
          data: null,
          error: result.error.message,
        };
      }

      const { conversation, participants, messages } = result.value;

      const isParticipant = participants.some(
        (participant) => participant.userId === userId
      );

      if (!isParticipant) {
        return {
          data: null,
          error: "You are not a participant of this conversation",
        };
      }

      const currentParticipant = participants.find(
        (participant) => participant.userId === userId
      );

      conversation.title = this.conversationTitleService.buildConversationTitle(
        {
          currentParticipant: {
            id: currentParticipant.userId,
            customTitle: currentParticipant.customTitle,
          },
          participantList: participants,
        }
      );

      const defaultGroupAvatars = getConversationAvatar({
        currentParticipant: currentParticipant.userId,
        allParticipants: participants,
        customGroupAvatar: conversation.groupAvatar,
      });

      return {
        data: {
          conversation: ConversationUseCaseMapper.fromEntityToDetailUseCaseDTO(
            conversation,
            defaultGroupAvatars
          ),
          participants,
          messages,
        },
      };
    } catch (error) {
      return {
        data: null,
        error: `Error finding conversation with id ${id}: ${error.message}`,
      };
    }
  }
}
