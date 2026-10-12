import { MessageUseCaseMapper } from "@application/usecases/dtos";
import { IMessageRepository } from "@domain/repositories";
import { TYPES } from "@infrastructure/external/di/inversify/types";
import { ILogger } from "@shared/logger";
import { inject, injectable } from "inversify";
import { GetMessageByIdRequest } from "./get-message-by-id.request";
import { GetMessageByIdResponse } from "./get-message-by-id.response";
import { IGetMessageByIdUseCase } from "./get-message-by-id.usecase";

@injectable()
export class GetMessageByIdUseCase implements IGetMessageByIdUseCase {
  constructor(
    @inject(TYPES.MessageRepository)
    private readonly messageRepository: IMessageRepository,

    @inject(TYPES.WinstonLogger)
    private logger: ILogger
  ) {}

  async execute({
    id,
    userId,
  }: GetMessageByIdRequest): Promise<GetMessageByIdResponse> {
    try {
      // check if the message exists and belongs to the user
      const { value: message, error: messageError } =
        await this.messageRepository.getMessageById(id);

      if (messageError) {
        this.logger.error(messageError.message);
        return { data: null, error: messageError.message };
      }

      // Ensure the message exists and the user is the sender
      if (!message || message.senderId !== userId) {
        this.logger.error(
          `Message not found or user does not have permission to view message with id ${id}`
        );
        return {
          data: null,
          error:
            "Message not found or you do not have permission to view this message.",
        };
      }

      return {
        data: MessageUseCaseMapper.toUseCaseDTO(message),
      };
    } catch (error) {
      this.logger.error(
        `Error executing get message by id use case: ${error.message}`
      );
      return {
        data: null,
        error: `Error executing get message by id use case: ${error.message}`,
      };
    }
  }
}
