import { IGetMessageByIdUseCase } from "@application/usecases/message";
import { IMessageEventPublisher } from "@domain/events";
import { IParticipantRepository } from "@domain/repositories";
import { TYPES } from "@infrastructure/external/di/inversify";
import { ILogger } from "@shared/logger";
import { inject, injectable } from "inversify";
import { IGetParticipantsByConversationIdUseCase } from "../get-participants-by-conversation-id";
import { UpdateParticipantLastReceivedMessageRequest } from "./update-last-received-message.request";
import { UpdateParticipantLastReceivedMessageResponse } from "./update-last-received-message.response";
import { IUpdateParticipantLastReceivedMessageUseCase } from "./update-last-received-message.usecase";

@injectable()
export class UpdateParticipantLastReceivedMessageUseCase
  implements IUpdateParticipantLastReceivedMessageUseCase
{
  constructor(
    @inject(TYPES.ParticipantRepository)
    private participantRepository: IParticipantRepository,

    @inject(TYPES.GetMessageByIdUseCase)
    private getMessageByIdUseCase: IGetMessageByIdUseCase,

    @inject(TYPES.GetParticipantsByConversationIdUseCase)
    private getParticipantsByConversationIdUseCase: IGetParticipantsByConversationIdUseCase,

    @inject(TYPES.MessagePublisher)
    private messagePublisher: IMessageEventPublisher,

    @inject(TYPES.WinstonLogger)
    private logger: ILogger
  ) {}

  async execute(
    request: UpdateParticipantLastReceivedMessageRequest
  ): Promise<UpdateParticipantLastReceivedMessageResponse> {
    try {
      const { participantId, messageId, userId } = request;

      const { data: messageData, error: messageError } =
        await this.getMessageByIdUseCase.execute({
          id: messageId,
          userId,
        });

      if (!messageData || messageError) {
        this.logger.error(messageError);
        return {
          data: null,
          error:
            "User does not have permission to update status of this message or message does not exist.",
        };
      }

      const { data: participants, error: participantsError } =
        await this.getParticipantsByConversationIdUseCase.execute({
          conversationId: messageData.conversationId,
          currentUserId: userId,
        });

      if (participantsError || !participants) {
        this.logger.error(participantsError);
        return {
          data: null,
          error: "Error fetching participants or no participants found.",
        };
      }

      const isValidPartcipant = participants.find(
        (participant) => participant.id === participantId
      );

      if (!isValidPartcipant) {
        this.logger.error("Participant does not exist.");
        return {
          data: null,
          error: "Participant does not exist.",
        };
      }

      const { value, error } =
        await this.participantRepository.updateLastReceivedMessage(
          messageId,
          participantId
        );

      if (error) {
        this.logger.error(error.message);
        return { data: null, error: error.message };
      }

      // Publish event to notify back to the client about the update
      await this.messagePublisher.publishLastReceivedMessageUpdated({
        messageId,
        participantId,
        conversationId: messageData.conversationId,
      });

      return { data: value };
    } catch (error: any) {
      this.logger.error(
        `[UpdateParticipantLastReceivedMessageUseCase]: Error executing update last received message use case: ${error.message}`
      );
      return {
        data: null,
        error: `Error executing update last received message use case: ${error.message}`,
      };
    }
  }
}
