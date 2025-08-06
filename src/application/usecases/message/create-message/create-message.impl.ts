import { ICreateConversationUsecase } from "@application/usecases/conversation";
import { MessageUseCaseMapper } from "@application/usecases/dtos";
import { Conversation, Message } from "@domain/entities";
import {
  IConversationRepository,
  IMessageRepository,
} from "@domain/repositories";
import { TYPES } from "@infrastructure/external/di/inversify/types";
import { ILogger } from "@shared/logger";
import { inject, injectable } from "inversify";
import isNil from "lodash/isNil";
import { CreateMessageRequest } from "./create-message.request";
import { CreateMessageResponse } from "./create-message.response";
import { ICreateMessageUseCase } from "./create-message.usecase";

@injectable()
export class CreateMessageUseCase implements ICreateMessageUseCase {
  constructor(
    @inject(TYPES.MessagePrismaRepository)
    private messageRepository: IMessageRepository,

    @inject(TYPES.ConversationPrismaRepository)
    private conversationRepository: IConversationRepository,

    @inject(TYPES.CreateConversationUseCase)
    private createConversationUseCase: ICreateConversationUsecase,

    @inject(TYPES.WinstonLogger)
    private logger: ILogger
  ) {}

  async execute({
    content,
    conversationId,
    receivers,
    extra,
    messageType,
    replyToMessageId,
    currentUserId,
  }: CreateMessageRequest): Promise<CreateMessageResponse> {
    try {
      if (!content.trim()) {
        return {
          data: null,
          error: "Message content cannot be empty",
        };
      }

      if (content.trim().length > 1000) {
        return {
          data: null,
          error: "Message content cannot be longer than 1000 characters",
        };
      }

      let currentConversation: Conversation = null;

      if (isNil(conversationId)) {
        // Create a new conversation in case this is the first message.
        const { data: newConversation, error: newConversationError } =
          await this.createConversationUseCase.execute({
            participants: receivers,
            userId: currentUserId,
          });

        if (newConversationError) {
          return {
            data: null,
            error: `Error starting conversation: ${newConversationError}`,
          };
        }

        currentConversation = newConversation;

        conversationId = newConversation.id;
      } else {
        // Check if the conversation exists and if the user is a participant.
        const {
          value: { conversation, participants },
          error: conversationError,
        } = await this.conversationRepository.getConversationById(
          conversationId
        );

        if (conversationError || !conversation.id) {
          return {
            data: null,
            error: `Conversation with ID ${conversationId} does not exist.`,
          };
        }

        currentConversation = conversation;

        const isMember = participants.some(
          (participant) => participant.userId === currentUserId
        );

        if (!isMember) {
          return {
            data: null,
            error: `User ${currentUserId} is not a participant in the conversation.`,
          };
        }
      }

      const messageData = await Message.create(
        {
          content,
          conversationId,
          receivers,
          extra,
          messageType,
          replyToMessageId,
        },
        currentUserId
      );

      const response = await this.messageRepository.createMessage(messageData);

      if (response.error) {
        this.logger.error(`Error creating message: ${response.error.message}`);
        return { data: null, error: response.error.message };
      }

      // Update the field `lastMessage` in the conversation.
      currentConversation.lastMessageAt = response.value.createdAt;

      const { error: updateError } =
        await this.conversationRepository.updateConversation(
          conversationId,
          currentConversation
        );

      if (updateError) {
        this.logger.error(
          `Error updating last message time for the conversation: ${updateError.message}`
        );
        return { data: null, error: updateError.message };
      }

      return { data: MessageUseCaseMapper.toUseCaseDTO(response.value) };
    } catch (error) {
      this.logger.error(
        `Error executing create message use case: ${error.message}`
      );
      return {
        data: null,
        error: `Error executing create message use case: ${error.message}`,
      };
    }
  }
}
