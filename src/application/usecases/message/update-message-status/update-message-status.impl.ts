import { MessageUseCaseMapper } from "@application/usecases/dtos";
import { IMessageEventPublisher } from "@domain/events";
import { IMessageRepository } from "@domain/repositories";
import { TYPES } from "@infrastructure/external/di/inversify/types";
import { ILogger } from "@shared/logger";
import { inject, injectable } from "inversify";
import { UpdateMessageStatusRequest } from "./update-message-status.request";
import { UpdateMessageStatusResponse } from "./update-message-status.response";
import { IUpdateMessageStatusUseCase } from "./update-message-status.usecase";

@injectable()
export class UpdateMessageStatusUseCase implements IUpdateMessageStatusUseCase {
  constructor(
    @inject(TYPES.MessageRepository)
    private readonly messageRepository: IMessageRepository,

    @inject(TYPES.MessagePublisher)
    private readonly messagePublisher: IMessageEventPublisher,

    @inject(TYPES.WinstonLogger)
    private readonly logger: ILogger
  ) {}

  async execute(
    request: UpdateMessageStatusRequest
  ): Promise<UpdateMessageStatusResponse> {
    const { id, status, currentUserId } = request;

    try {
      // Validate the request
      if (!id || !status) {
        throw new Error("Invalid request: id and status are required");
      }

      // // Check if the message exists and belongs to the user
      const { value: message, error: messageError } =
        await this.messageRepository.getMessageById(id);

      if (messageError) {
        this.logger.error(messageError.message);
        return { data: null, error: messageError.message };
      }

      // Ensure the message exists and the user is the sender
      if (!message || message.senderId !== currentUserId) {
        this.logger.error(
          `Message not found or user does not have permission to update message with id ${id}`
        );
        return {
          data: null,
          error:
            "Message not found or you do not have permission to update this message.",
        };
      }

      // Proceed to update the message
      const result = await this.messageRepository.updateMessageStatus(
        id,
        status
      );

      if (result.error || !result.value) {
        this.logger.error(
          `Error updating message status with id ${id}: ${result.error?.message}`
        );
        return {
          data: null,
          error: result.error.message || "Failed to update message status",
        };
      }

      const data = MessageUseCaseMapper.toUseCaseDTO(result.value);

      // Publish message sent event
      await this.messagePublisher.publishMessageStatusUpdated({
        messageId: data.id,
        status: data.status,
      });

      return { data };
    } catch (error) {
      this.logger.error(
        `Error executing update message status use case: ${error.message}`
      );
      return {
        error: `Error executing update message status use case: ${error.message}`,
        data: null,
      };
    }
  }
}
