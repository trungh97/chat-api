import { ICreateSystemMessageRequestDTO } from "@domain/dtos/message";
import { ICreateParticipantRequestDTO } from "@domain/dtos/participant";
import { Participant } from "@domain/entities";
import { ConversationType, SystemMessageType } from "@domain/enums";
import {
  IConversationRepository,
  IParticipantRepository,
} from "@domain/repositories";
import { ICreateSystemMessageUseCase } from "@domain/usecases/message";
import { IAddingParticipantAndNotifyUseCase } from "@domain/usecases/participant";
import { TYPES } from "@infrastructure/external/di/inversify";
import { ILogger } from "@shared/logger";
import { UseCaseResponse } from "@shared/responses";
import { inject, injectable } from "inversify";

@injectable()
export class AddParticipantAndNotifyUseCase
  implements IAddingParticipantAndNotifyUseCase
{
  constructor(
    @inject(TYPES.ParticipantPrismaRepository)
    private participantRepository: IParticipantRepository,

    @inject(TYPES.ConversationPrismaRepository)
    private conversationRepository: IConversationRepository,

    @inject(TYPES.CreateSystemMessageUseCase)
    private createSystemMessageUseCase: ICreateSystemMessageUseCase,

    @inject(TYPES.WinstonLogger)
    private logger: ILogger
  ) {}

  async execute(
    request: ICreateParticipantRequestDTO,
    currentUserId: string
  ): Promise<UseCaseResponse<Participant>> {
    try {
      // check if the conversation existed
      const { value: conversation, error: conversationError } =
        await this.conversationRepository.getConversationById(
          request.conversationId
        );

      if (conversationError || !conversation.id) {
        this.logger.error(
          `Error getting conversation: ${conversationError.message}`
        );
        return { data: null, error: conversationError.message };
      }

      // check if the conversation is a group conversation
      if (conversation.type !== ConversationType.GROUP) {
        this.logger.error(
          `Conversation ${request.conversationId} is not a group conversation`
        );
        return {
          data: null,
          error: `Conversation ${request.conversationId} is not a group conversation`,
        };
      }

      // check if the current user is a member of the conversation
      const conversationParticipants =
        await this.participantRepository.getParticipantsByConversationId(
          request.conversationId
        );

      if (conversationParticipants.error || !conversationParticipants.value) {
        this.logger.error(
          `Error getting participants: ${conversationParticipants.error.message}`
        );
        return { data: null, error: "Error creating participant" };
      }

      const isConversationMember = conversationParticipants.value.find(
        (participant) => participant.userId === currentUserId
      );

      if (!isConversationMember) {
        this.logger.error(
          `User ${currentUserId} is not authorized to create a participant for conversation ${request.conversationId}`
        );
        return {
          data: null,
          error: `User ${currentUserId} is not authorized to create a participant for conversation ${request.conversationId}`,
        };
      }

      // check if the participant already existed
      const existingParticipant = conversationParticipants.value.find(
        (p) => p.userId === request.userId
      );

      if (existingParticipant) {
        this.logger.error(
          `Participant ${request.userId} already exists in conversation ${request.conversationId}`
        );
        return {
          data: null,
          error: `Participant ${request.userId} already exists in conversation ${request.conversationId}`,
        };
      }

      const participantRequest = await Participant.create(request);

      const response = await this.participantRepository.createParticipant(
        participantRequest
      );

      if (response.error) {
        this.logger.error(
          `Error adding participant: ${response.error.message}`
        );
        return { data: null, error: response.error.message };
      }

      // Create a system message to notify that a participant has joined the conversation
      const systemMessageRequest: ICreateSystemMessageRequestDTO = {
        conversationId: request.conversationId,
        systemMessageType: SystemMessageType.PARTICIPANT_JOINED,
        relatedUser: response.value.name,
      };

      const systemMessageResponse =
        await this.createSystemMessageUseCase.execute(systemMessageRequest);

      if (systemMessageResponse.error || !systemMessageResponse.data.id) {
        this.logger.error(
          `Error creating system message: ${systemMessageResponse.error}`
        );
        return {
          data: null,
          error: systemMessageResponse.error,
        };
      }

      return { data: response.value };
    } catch (error) {
      this.logger.error(
        `Error executing add participant use case: ${error.message}`
      );
      return {
        data: null,
        error: `Error executing add participant use case: ${error.message}`,
      };
    }
  }
}
