import { ICreateMessageRequestDTO } from "@domain/dtos/message";
import { MessageProps } from "@domain/entities";
import { ICreateMessageUseCase } from "@domain/usecases/message";
import { container, TYPES } from "@infrastructure/external/di/inversify";
import { pubSub } from "@infrastructure/persistence/websocket/connection";
import { Topic } from "@infrastructure/persistence/websocket/topics";
import { ILogger } from "@shared/logger";
import { GlobalResponse } from "@shared/responses";
import { StatusCodes } from "http-status-codes";
import isNil from "lodash/isNil";
import {
  Arg,
  Ctx,
  Mutation,
  ObjectType,
  Resolver,
  Root,
  Subscription,
} from "type-graphql";
import { Context } from "types";
import { MessageDTO } from "../DTOs";
import { MessageMapper } from "../mappers";
import { MessageCreateMutationRequest } from "../types/message";

const MessageResponseObjectType = GlobalResponse(MessageDTO);

@ObjectType()
class MessageResponse extends MessageResponseObjectType {}

@Resolver()
export class MessageResolver {
  private createMessageUseCase: ICreateMessageUseCase;
  private logger: ILogger;

  constructor() {
    this.createMessageUseCase = container.get<ICreateMessageUseCase>(
      TYPES.CreateMessageUseCase
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
      const { data, error } = await this.createMessageUseCase.execute(
        userId,
        request
      );

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
        statusCode: 200,
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

  @Subscription(() => MessageDTO, { topics: Topic.NEW_MESSAGE })
  newMessageAdded(@Root() message: MessageProps): MessageDTO {
    return {
      ...message,
      extra: isNil(message.extra) ? null : JSON.stringify(message.extra),
    };
  }
}
