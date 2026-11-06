import { ICreateConversationUsecase } from "@application/usecases/conversation";
import { MessageUseCaseMapper } from "@application/usecases/dtos";
import { IDetailedMessageRepositoryDTO } from "@domain/dtos";
import { Conversation, Message } from "@domain/entities";
import { IMessageEventPublisher } from "@domain/events";
import {
  IConversationRepository,
  IMessageRepository,
  IUserRepository,
} from "@domain/repositories";
import { ITransactionManager, TransactionAbortError } from "@domain/services";
import { TYPES } from "@infrastructure/external/di/inversify/types";
import { ILogger } from "@shared/logger";
import { inject, injectable } from "inversify";
import compact from "lodash/compact";
import isNil from "lodash/isNil";
import uniq from "lodash/uniq";
import { CreateMessageRequest } from "./create-message.request";
import { CreateMessageResponse } from "./create-message.response";
import { ICreateMessageUseCase } from "./create-message.usecase";

/** Matches the `message.client_message_id` column size. */
const MAX_CLIENT_MESSAGE_ID_LENGTH = 64;

type SavedMessage = {
  message: IDetailedMessageRepositoryDTO;
  conversation: Conversation;
  recipientUserIds: string[];
};

@injectable()
export class CreateMessageUseCase implements ICreateMessageUseCase {
  constructor(
    @inject(TYPES.MessageRepository)
    private messageRepository: IMessageRepository,

    @inject(TYPES.ConversationRepository)
    private conversationRepository: IConversationRepository,

    @inject(TYPES.MessagePublisher)
    private messagePublisher: IMessageEventPublisher,

    @inject(TYPES.CreateConversationUseCase)
    private createConversationUseCase: ICreateConversationUsecase,

    @inject(TYPES.UserRepository)
    private userRepository: IUserRepository,

    @inject(TYPES.TransactionManager)
    private transactionManager: ITransactionManager,

    @inject(TYPES.WinstonLogger)
    private logger: ILogger
  ) {}

  async execute(request: CreateMessageRequest): Promise<CreateMessageResponse> {
    try {
      const { content, currentUserId, clientMessageId, conversationId } =
        request;

      if (!content.trim()) {
        return {
          data: null,
          error: "Message content cannot be empty",
        };
      }

      if (
        clientMessageId !== undefined &&
        (!clientMessageId.trim() ||
          clientMessageId.length > MAX_CLIENT_MESSAGE_ID_LENGTH)
      ) {
        return {
          data: null,
          error: `Client message id must be 1-${MAX_CLIENT_MESSAGE_ID_LENGTH} characters`,
        };
      }

      // A retry of a message that was already saved: return it instead of creating a duplicate.
      if (clientMessageId) {
        const { value: existingMessage, error: existingMessageError } =
          await this.messageRepository.getMessageByClientMessageId(
            currentUserId,
            clientMessageId
          );

        if (existingMessageError) {
          return { data: null, error: existingMessageError.message };
        }

        if (existingMessage) {
          if (
            conversationId &&
            existingMessage.conversationId !== conversationId
          ) {
            return {
              data: null,
              error:
                "Client message id was already used in another conversation",
            };
          }

          return { data: MessageUseCaseMapper.toUseCaseDTO(existingMessage) };
        }
      }

      // Everything that writes runs in one transaction, so a failure leaves no
      // conversation or message behind.
      const saved = await this.transactionManager.run(() =>
        this.saveMessage(request)
      );

      const data = MessageUseCaseMapper.toUseCaseDTO(saved.message);

      // Publish only after the commit, so subscribers never see a rolled-back message.
      await this.publishMessageSent(saved, data);

      return { data };
    } catch (error) {
      if (error instanceof TransactionAbortError) {
        return { data: null, error: error.message };
      }

      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error executing create message use case: ${message}`);
      return {
        data: null,
        error: `Error executing create message use case: ${message}`,
      };
    }
  }

  /**
   * Finds or creates the conversation, saves the message and updates the conversation's
   * last message. Runs inside the transaction: any failure throws `TransactionAbortError`.
   */
  private async saveMessage(
    request: CreateMessageRequest
  ): Promise<SavedMessage> {
    const {
      content,
      receivers,
      extra,
      messageType,
      replyToMessageId,
      currentUserId,
      clientMessageId,
    } = request;

    let conversation: Conversation;
    let recipientUserIds: string[];

    if (isNil(request.conversationId)) {
      const otherUserIds = uniq(compact(receivers)).filter(
        (id) => id !== currentUserId
      );

      if (receivers?.length && otherUserIds.length === 0) {
        throw new TransactionAbortError(
          "You can't send a direct message to yourself."
        );
      }

      if (otherUserIds.length === 1) {
        conversation = await this.getOrCreateDirectConversation(
          currentUserId,
          otherUserIds[0]
        );
        recipientUserIds = [currentUserId, otherUserIds[0]];
      } else {
        // A group conversation: create it for this first message.
        const { data: newConversation, error: newConversationError } =
          await this.createConversationUseCase.execute({
            participants: receivers,
            userId: currentUserId,
          });

        if (newConversationError) {
          throw new TransactionAbortError(
            `Error starting conversation: ${newConversationError}`
          );
        }

        conversation = newConversation;
        recipientUserIds = uniq([currentUserId, ...(receivers ?? [])]);
      }
    } else {
      // Check if the conversation exists and if the user is a participant.
      const {
        value: { conversation: existingConversation, participants },
        error: conversationError,
      } = await this.conversationRepository.getConversationById(
        request.conversationId
      );

      if (conversationError || !existingConversation.id) {
        throw new TransactionAbortError(
          `Conversation with ID ${request.conversationId} does not exist.`
        );
      }

      const isMember = participants.some(
        (participant) => participant.userId === currentUserId
      );

      if (!isMember) {
        throw new TransactionAbortError(
          `User ${currentUserId} is not a participant in the conversation.`
        );
      }

      conversation = existingConversation;
      recipientUserIds = participants.map((participant) => participant.userId);
    }

    const messageData = await Message.create(
      {
        content,
        conversationId: conversation.id,
        receivers,
        extra,
        messageType,
        replyToMessageId,
        clientMessageId,
      },
      currentUserId
    );

    const response = await this.messageRepository.createMessage(messageData);

    if (response.error) {
      this.logger.error(`Error creating message: ${response.error.message}`);
      throw new TransactionAbortError(response.error.message);
    }

    // Update the field `lastMessage` in the conversation.
    conversation.lastMessageAt = response.value.createdAt;
    conversation.lastMessageId = response.value.id;

    const { error: updateError } =
      await this.conversationRepository.updateConversation(
        conversation.id,
        conversation
      );

    if (updateError) {
      this.logger.error(
        `Error updating last message time for the conversation: ${updateError.message}`
      );
      throw new TransactionAbortError(updateError.message);
    }

    return { message: response.value, conversation, recipientUserIds };
  }

  /**
   * Returns the 1:1 conversation between the sender and the recipient, creating it if
   * there is none. Locking both users first makes two simultaneous first messages
   * between the same pair run one after the other, so only one conversation is created.
   */
  private async getOrCreateDirectConversation(
    senderId: string,
    recipientId: string
  ): Promise<Conversation> {
    // The lock must be the first read in the transaction. MySQL takes the snapshot for
    // plain reads at the first one, so reads after the lock see a conversation that a
    // transaction we waited for has just committed.
    const { value: lockedUserIds, error: lockError } =
      await this.userRepository.lockUsersForUpdate(senderId, recipientId);

    if (lockError) {
      throw new TransactionAbortError(lockError.message);
    }

    if (!lockedUserIds.includes(senderId)) {
      throw new TransactionAbortError("Your account no longer exists.");
    }

    if (!lockedUserIds.includes(recipientId)) {
      throw new TransactionAbortError("The recipient does not exist.");
    }

    const { value: recipient, error: recipientError } =
      await this.userRepository.getUserById(recipientId);

    // The lock already showed the recipient exists, so an error here is a database failure.
    if (recipientError || !recipient) {
      throw new TransactionAbortError(
        recipientError?.message ?? "The recipient does not exist."
      );
    }

    if (!recipient.isActive) {
      throw new TransactionAbortError("The recipient is no longer active.");
    }

    const { value: existingConversation, error: findError } =
      await this.conversationRepository.findPrivateBetween(
        senderId,
        recipientId
      );

    if (findError) {
      throw new TransactionAbortError(findError.message);
    }

    if (existingConversation) {
      return existingConversation;
    }

    const { data: newConversation, error: newConversationError } =
      await this.createConversationUseCase.execute({
        participants: [recipientId],
        userId: senderId,
      });

    if (newConversationError) {
      throw new TransactionAbortError(
        `Error starting conversation: ${newConversationError}`
      );
    }

    return newConversation;
  }

  /**
   * The message is already committed, so a publish failure is logged rather than
   * returned: the sender's retry would get the saved message back anyway.
   */
  private async publishMessageSent(
    { message, conversation, recipientUserIds }: SavedMessage,
    data: ReturnType<typeof MessageUseCaseMapper.toUseCaseDTO>
  ): Promise<void> {
    try {
      await this.messagePublisher.publishMessageSent({
        message: MessageUseCaseMapper.toEntity(message),
        sender: {
          name: data.senderName,
          avatar: data.senderAvatar,
        },
        conversation,
        recipientUserIds,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error publishing the new message: ${errorMessage}`);
    }
  }
}
