import {
  ICreateSystemMessageRequest,
  ICreateSystemMessageUseCase,
} from "@application/usecases/message";
import { Participant } from "@domain/entities";
import { ConversationType, SystemMessageType } from "@domain/enums";
import {
  IConversationRepository,
  IParticipantRepository,
} from "@domain/repositories";
import { TYPES } from "@infrastructure/external/di/inversify";
import { ILogger } from "@shared/logger";
import { inject, injectable } from "inversify";
import { ICreateParticipantRequestDTO } from "./add-participant-and-notify.request";
import { AddParticipantAndNotifyResponse } from "./add-participant-and-notify.response";
import { IAddingParticipantAndNotifyUseCase } from "./add-participant-and-notify.usecase";

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
  ): Promise<AddParticipantAndNotifyResponse> {
    try {
      // check if the conversation existed
      const {
        value: { conversation, participants: conversationParticipants },
        error: conversationError,
      } = await this.conversationRepository.getConversationById(
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
      const isConversationMember = conversationParticipants.find(
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
      const existingParticipant = conversationParticipants.find(
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
      const systemMessageRequest: ICreateSystemMessageRequest = {
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
