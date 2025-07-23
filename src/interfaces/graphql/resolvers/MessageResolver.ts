import {
  ICreateMessageRequestDTO,
  ICreateMessageUseCase,
  IGetMessagesByConversationIdUseCase,
} from "@application/usecases/message";
import { MessageProps } from "@domain/entities";
import { ICursorBasedPaginationParams } from "@domain/interfaces/pagination/CursorBasedPagination";
import { container, TYPES } from "@infrastructure/external/di/inversify";
import { pubSub } from "@infrastructure/persistence/websocket/connection";
import { Topic } from "@infrastructure/persistence/websocket/topics";
import { ILogger } from "@shared/logger";
import { CursorBasedPaginationDTO, GlobalResponse } from "@shared/responses";
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
import { MessageDTO } from "../dtos";
import { MessageMapper } from "../mappers";
import { MessageCreateMutationRequest } from "../types/message";
import { CursorBasedPaginationParams } from "../types/pagination";

const MessageResponseObjectType = GlobalResponse(MessageDTO);

@ObjectType()
class MessageResponse extends MessageResponseObjectType {}

@ObjectType()
class PaginatedMessageListResponse extends CursorBasedPaginationDTO(
  MessageDTO
) {}

@ObjectType()
class MessageListGlobalResponse extends GlobalResponse(
  PaginatedMessageListResponse
) {}

@Resolver()
export class MessageResolver {
  private createMessageUseCase: ICreateMessageUseCase;
  private getMessagesByConversationIdUseCase: IGetMessagesByConversationIdUseCase;
  private logger: ILogger;

  constructor() {
    this.createMessageUseCase = container.get<ICreateMessageUseCase>(
      TYPES.CreateMessageUseCase
    );
    this.getMessagesByConversationIdUseCase =
      container.get<IGetMessagesByConversationIdUseCase>(
        TYPES.GetMessagesByConversationIdUseCase
      );
    this.logger = container.get<ILogger>(TYPES.WinstonLogger);
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
      await pubSub.publish(Topic.NEW_MESSAGE, finalResult);

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
    options: ICursorBasedPaginationParams
  ): Promise<MessageListGlobalResponse> {
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
          items: data.data.map(MessageMapper.toDTO),
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

  @Subscription(() => MessageDTO, { topics: Topic.NEW_MESSAGE })
  newMessageAdded(@Root() message: MessageProps): MessageDTO {
    return {
      ...message,
      extra: isNil(message.extra) ? null : JSON.stringify(message.extra),
    };
  }
}
