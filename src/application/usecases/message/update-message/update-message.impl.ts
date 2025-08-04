import { MessageUseCaseMapper } from "@application/usecases/dtos";
import { IMessageRepository } from "@domain/repositories";
import { TYPES } from "@infrastructure/external/di/inversify";
import { ILogger } from "@shared/logger";
import { inject, injectable } from "inversify";
import { UpdateMessageRequest } from "./update-message.request";
import { UpdateMessageResponse } from "./update-message.response";
import { IUpdateMessageUseCase } from "./update-message.usecase";

@injectable()
export class UpdateMessageUseCase implements IUpdateMessageUseCase {
  constructor(
    @inject(TYPES.MessagePrismaRepository)
    private readonly messageRepository: IMessageRepository,

    @inject(TYPES.WinstonLogger)
    private readonly logger: ILogger
  ) {}

  async execute(request: UpdateMessageRequest): Promise<UpdateMessageResponse> {
    const { id, updates, userId } = request;

    try {
      // Validate the request
      if (!id || !updates.content) {
        return {
          data: null,
          error: "Invalid request: id and content are required",
        };
      }

      // Check if the message exists and belongs to the user
      const { value: message, error: messageError } =
        await this.messageRepository.getMessageById(id);

      if (messageError) {
        this.logger.error(messageError.message);
        return { data: null, error: messageError.message };
      }

      // Ensure the message exists and the user is the sender
      if (!message || message.senderId !== userId) {
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
      const result = await this.messageRepository.updateMessage(id, updates);

      if (result.error || !result.value) {
        this.logger.error(
          `Error updating message with id ${id}: ${result.error?.message}`
        );
        return {
          data: null,
          error: result.error.message || "Failed to update message",
        };
      }

      return { data: MessageUseCaseMapper.toUseCaseDTO(result.value) };
    } catch (error) {
      this.logger.error(
        `Error executing update message use case: ${error.message}`
      );
      return {
        error: `Error executing update message use case: ${error.message}`,
        data: null,
      };
    }
  }
}
