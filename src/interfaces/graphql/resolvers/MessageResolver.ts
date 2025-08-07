import {
  ICreateMessageRequestDTO,
  ICreateMessageUseCase,
  IDeleteMessageUseCase,
  IGetMessageByIdUseCase,
  IGetMessagesByConversationIdUseCase,
  IUpdateMessageRequestDTO,
  IUpdateMessageUseCase,
} from "@application/usecases/message";
import { ICursorBasedPaginationParams } from "@domain/interfaces/pagination/CursorBasedPagination";
import { container } from "@infrastructure/external/di/inversify/inversify.config";
import { TYPES } from "@infrastructure/external/di/inversify/types";
import { pubSub } from "@infrastructure/persistence/websocket/connection";
import { Topic } from "@infrastructure/persistence/websocket/topics";
import { ILogger } from "@shared/logger";
import {
  CursorBasedPaginationDTO,
  GlobalResponse,
  UnauthorizedResponse,
} from "@shared/responses";
import { StatusCodes } from "http-status-codes";
import isNil from "lodash/isNil";
import {
  Arg,
  Ctx,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  Subscription,
} from "type-graphql";
import { Context } from "types";
import { MessageDTO, MessageWithSenderDTO } from "../dtos";
import { MessageMapper } from "../mappers";
import {
  MessageCreateMutationRequest,
  MessageUpdateMutationRequest,
} from "../types/message";
import { CursorBasedPaginationParams } from "../types/pagination";

const MessageResponseObjectType = GlobalResponse(MessageDTO);

@ObjectType()
class MessageResponse extends MessageResponseObjectType {}

@ObjectType()
class PaginatedMessageListResponse extends CursorBasedPaginationDTO(
  MessageWithSenderDTO
) {}

@ObjectType()
class MessageListGlobalResponse extends GlobalResponse(
  PaginatedMessageListResponse
) {}

@Resolver()
export class MessageResolver {
  private createMessageUseCase: ICreateMessageUseCase;
  private getMessagesByConversationIdUseCase: IGetMessagesByConversationIdUseCase;
  private updateMessageUseCase: IUpdateMessageUseCase;
  private getMessageByIdUseCase: IGetMessageByIdUseCase;
  private deleteMessageUseCase: IDeleteMessageUseCase;
  private logger: ILogger;

  constructor() {
    this.createMessageUseCase = container.get<ICreateMessageUseCase>(
      TYPES.CreateMessageUseCase
    );
    this.getMessagesByConversationIdUseCase =
      container.get<IGetMessagesByConversationIdUseCase>(
        TYPES.GetMessagesByConversationIdUseCase
      );
    this.updateMessageUseCase = container.get<IUpdateMessageUseCase>(
      TYPES.UpdateMessageUseCase
    );
    this.getMessageByIdUseCase = container.get<IGetMessageByIdUseCase>(
      TYPES.GetMessageByIdUseCase
    );
    this.deleteMessageUseCase = container.get<IDeleteMessageUseCase>(
      TYPES.DeleteMessageUseCase
    );
    this.logger = container.get<ILogger>(TYPES.WinstonLogger);
  }

  @Mutation(() => MessageResponse)
  async updateMessage(
    @Arg("request", () => MessageUpdateMutationRequest)
    request: IUpdateMessageRequestDTO,
    @Ctx()
    {
      req: {
        session: { userId },
      },
    }: Context
  ): Promise<MessageResponse> {
    if (!userId) return UnauthorizedResponse;

    try {
      const { data, error } = await this.updateMessageUseCase.execute({
        id: request.id,
        updates: request.updates,
        userId,
      });

      if (error || !data) {
        this.logger.error(`Error updating message: ${error}`);
        return {
          statusCode: StatusCodes.BAD_REQUEST,
          message: error,
          data: null,
          error,
        };
      }

      return {
        statusCode: StatusCodes.OK,
        message: "Message updated successfully",
        data: MessageMapper.toDTOWithSender(data),
      };
    } catch (error) {
      this.logger.error(`Error updating message: ${error.message}`);
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to update message",
        data: null,
        error: error.message,
      };
    }
  }

  @Query(() => MessageResponse)
  async getMessageById(
    @Arg("id", () => String) id: string,
    @Ctx()
    {
      req: {
        session: { userId },
      },
    }: Context
  ): Promise<MessageResponse> {
    if (!userId) return UnauthorizedResponse;

    try {
      const { data, error } = await this.getMessageByIdUseCase.execute({
        id,
        userId,
      });

      if (error || !data) {
        this.logger.error(`Error getting message by id: ${error}`);
        return {
          statusCode: StatusCodes.BAD_REQUEST,
          message: error,
          data: null,
          error,
        };
      }

      return {
        statusCode: StatusCodes.OK,
        message: "Message fetched successfully",
        data: MessageMapper.toDTOWithSender(data),
      };
    } catch (error) {
      this.logger.error(`Error getting message by id: ${error.message}`);
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to get message by id",
        data: null,
        error: error.message,
      };
    }
  }

  @Mutation(() => MessageResponse)
  async deleteMessage(
    @Arg("id", () => String)
    id: string,
    @Ctx()
    {
      req: {
        session: { userId },
      },
    }: Context
  ): Promise<MessageResponse> {
    if (!userId) return UnauthorizedResponse;

    try {
      const { data, error } = await this.deleteMessageUseCase.execute({
        id,
        userId,
      });

      if (error || !data) {
        this.logger.error(`Error deleting message: ${error}`);
        return {
          statusCode: StatusCodes.BAD_REQUEST,
          message: error,
          data: null,
          error,
        };
      }

      return {
        statusCode: StatusCodes.OK,
        message: "Message deleted successfully",
      };
    } catch (error) {
      this.logger.error(`Error deleting message: ${error.message}`);
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to delete message",
        data: null,
        error: error.message,
      };
    }
  }

  @Mutation(() => MessageResponse)
  async createMessage(
    @Arg("request", () => MessageCreateMutationRequest)
    request: ICreateMessageRequestDTO,
    @Ctx()
    {
      req: {
        session: { userId },
      },
    }: Context
  ): Promise<MessageResponse> {
    try {
      if (!userId) return UnauthorizedResponse;

      const { data, error } = await this.createMessageUseCase.execute({
        ...request,
        currentUserId: userId,
      });

      if (error) {
        this.logger.error(`Error creating message: ${error}`);
        return {
          statusCode: StatusCodes.BAD_REQUEST,
          message: error,
          data: null,
          error,
        };
      }

      const finalResult = MessageMapper.toDTO(data);

      // Publish the new message to the WebSocket channel
      await pubSub.publish(
        Topic.NEW_MESSAGE,
        MessageMapper.toDTOWithSender(data)
      );

      return {
        statusCode: StatusCodes.CREATED,
        message: "Message created successfully",
        data: finalResult,
      };
    } catch (error) {
      this.logger.error(`Error creating message: ${error.message}`);
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to create message",
        data: null,
        error: error.message,
      };
    }
  }

  @Query(() => MessageListGlobalResponse)
  async getMessagesByConversationId(
    @Arg("conversationId", () => String) conversationId: string,
    @Arg("options", () => CursorBasedPaginationParams)
    options: ICursorBasedPaginationParams,
    @Ctx()
    {
      req: {
        session: { userId },
      },
    }: Context
  ): Promise<MessageListGlobalResponse> {
    if (!userId) return UnauthorizedResponse;

    try {
      const { data, error } =
        await this.getMessagesByConversationIdUseCase.execute({
          conversationId,
          cursor: options.cursor,
          limit: options.limit,
        });

      if (error || !data) {
        this.logger.error(`Error fetching messages: ${error}`);
        return { statusCode: StatusCodes.BAD_REQUEST, error };
      }

      return {
        statusCode: StatusCodes.OK,
        message: "Messages fetched successfully",
        data: {
          items: data.data.map(MessageMapper.toDTOWithSender),
          nextCursor: data.nextCursor,
        },
      };
    } catch (error) {
      this.logger.error(`Error fetching messages: ${error.message}`);
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        error: `Error fetching messages: ${error.message}`,
      };
    }
  }

  @Subscription(() => MessageWithSenderDTO, { topics: Topic.NEW_MESSAGE })
  newMessageAdded(@Root() message: MessageWithSenderDTO): MessageWithSenderDTO {
    return {
      ...message,
      extra: isNil(message.extra) ? null : JSON.stringify(message.extra),
    };
  }
}
