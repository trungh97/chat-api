import { IDeleteMessageUseCase } from "./delete-message.usecase";
import { DeleteMessageRequest } from "./delete-message.request";
import { DeleteMessageResponse } from "./delete-message.response";
import { IMessageRepository } from "@domain/repositories";
import { inject, injectable } from "inversify";
import { TYPES } from "@infrastructure/external/di/inversify/types";
import { ILogger } from "@shared/logger";

@injectable()
export class DeleteMessageUseCase implements IDeleteMessageUseCase {
  constructor(
    @inject(TYPES.MessagePrismaRepository)
    private readonly messageRepository: IMessageRepository,

    @inject(TYPES.WinstonLogger)
    private logger: ILogger
  ) {}

  async execute({
    id,
    userId,
  }: DeleteMessageRequest): Promise<DeleteMessageResponse> {
    try {
      if (!userId) throw new Error("User id is required");

      // Check if the message exists and belongs to the user
      const { value: message, error: messageError } =
        await this.messageRepository.getMessageById(id);

      if (messageError) {
        this.logger.error(messageError.message);
        return { data: null, error: messageError.message };
      }

      // Ensure the message exists and the user is the sender
      if (!message || message.senderId !== userId) {
        return {
          data: null,
          error:
            "Message not found or you do not have permission to delete this message.",
        };
      }

      // Proceed to delete the message
      const result = await this.messageRepository.deleteMessage(id);

      if (result.error || !result.value) {
        this.logger.error(
          `Error deleting message with id ${id}: ${result.error.message}`
        );
        return {
          data: null,
          error: result.error.message || "Fail to delete message!",
        };
      }

      return { data: result.value };
    } catch (error) {
      this.logger.error(
        `Error executing delete message use case: ${error.message}`
      );
      return {
        data: null,
        error: `Error executing delete message use case: ${error.message}`,
      };
    }
  }
}
