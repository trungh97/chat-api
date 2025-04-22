import {
  getConversationAvatar,
  getConversationTitle,
} from "@application/utils";
import {
  ExtendedConversation,
  IConversationResponseDTO,
} from "@domain/dtos/conversation";
import { IConversationRepository } from "@domain/repositories";
import { IFindConversationByIdUseCase } from "@domain/usecases/conversation";
import { TYPES } from "@infrastructure/external/di/inversify";
import { UseCaseResponse } from "@shared/responses";
import { inject, injectable } from "inversify";

@injectable()
class FindConversationByIdUseCase implements IFindConversationByIdUseCase {
  constructor(
    @inject(TYPES.ConversationPrismaRepository)
    private conversationRepository: IConversationRepository
  ) {}

  async execute(
    id: string,
    userId: string
  ): Promise<UseCaseResponse<IConversationResponseDTO>> {
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

      conversation.title = getConversationTitle({
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
        data: {
          conversation: extendedConversation,
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

export { FindConversationByIdUseCase };
