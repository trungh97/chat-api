import { ICreateMessageRequestDTO } from "@domain/dtos/message";
import { ICreateMessageUseCase } from "@domain/usecases/message";
import { container, TYPES } from "@infrastructure/external/di/inversify";
import { ILogger } from "@shared/logger";
import { GlobalResponse } from "@shared/responses";
import { StatusCodes } from "http-status-codes";
import { Arg, Ctx, Mutation, ObjectType, Resolver } from "type-graphql";
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

      return {
        statusCode: 200,
        message: "Message created successfully",
        data: MessageMapper.toDTO(data),
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
}
