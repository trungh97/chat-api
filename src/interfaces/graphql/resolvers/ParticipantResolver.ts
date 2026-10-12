import {
  IAddingParticipantAndNotifyUseCase,
  IBatchUpdateLastReceivedMessagesUseCase,
  ICreateParticipantRequestDTO,
} from "@application/usecases/participant";
import { IUpdateParticipantLastReceivedMessageUseCase } from "@application/usecases/participant/update-last-received-message";
import {
  PublishLastMessageReceivedEvent,
  PublishLastMessageSeenPayload,
} from "@domain/events";
import { container } from "@infrastructure/external/di/inversify/inversify.config";
import { TYPES } from "@infrastructure/external/di/inversify/types";
import { MessageQueueProducer } from "@infrastructure/persistence/queue/bullmq/MessageQueueProducer";
import { Topic } from "@infrastructure/persistence/websocket/redis-pubsub";
import { ILogger } from "@shared/logger";
import { isAuth } from "@shared/middlewares/isAuth";
import { GlobalResponse } from "@shared/responses";
import { StatusCodes } from "http-status-codes";
import {
  Arg,
  Ctx,
  Mutation,
  ObjectType,
  Resolver,
  Root,
  Subscription,
  UseMiddleware,
} from "type-graphql";
import { Context } from "types";
import {
  DetailedParticipantDTO,
  LastReceivedMessageUpdateBodyDTO,
  LastSeenMessageUpdateBodyDTO,
  ParticipantDTO,
} from "../dtos";
import {
  BatchUpdateLastReceivedMessageRequest,
  ParticipantCreateMutationRequest,
} from "../types/participant";
import { isRecipient } from "../subscriptionFilters";

const ParticipantResponseObjectType = GlobalResponse(ParticipantDTO);
const DetailedParticipantResponseObjectType = GlobalResponse(
  DetailedParticipantDTO
);
const BatchUpdateResponseObjectType = GlobalResponse(Boolean);

@ObjectType()
class ParticipantResponse extends ParticipantResponseObjectType {}

@ObjectType()
class DetailedParticipantResponse extends DetailedParticipantResponseObjectType {}

@ObjectType()
class BatchUpdateResponse extends BatchUpdateResponseObjectType {}

/** `data` is `true` if the pointer moved, `false` if it was already at or after the message. */
@ObjectType()
class PointerUpdateResponse extends BatchUpdateResponseObjectType {}

@Resolver()
export class ParticipantResolver {
  private addParticipantAndNotifyUseCase: IAddingParticipantAndNotifyUseCase;
  private updateLastReceivedMessageUseCase: IUpdateParticipantLastReceivedMessageUseCase;
  private batchUpdateLastReceivedMessagesUseCase: IBatchUpdateLastReceivedMessagesUseCase;

  private logger: ILogger;
  private messageQueueProducer: MessageQueueProducer;

  constructor() {
    this.addParticipantAndNotifyUseCase =
      container.get<IAddingParticipantAndNotifyUseCase>(
        TYPES.AddParticipantAndNotifyUseCase
      );
    this.updateLastReceivedMessageUseCase =
      container.get<IUpdateParticipantLastReceivedMessageUseCase>(
        TYPES.UpdateParticipantLastReceivedMessageUseCase
      );
    this.batchUpdateLastReceivedMessagesUseCase =
      container.get<IBatchUpdateLastReceivedMessagesUseCase>(
        TYPES.BatchUpdateLastReceivedMessagesUseCase
      );
    this.logger = container.get<ILogger>(TYPES.WinstonLogger);
    this.messageQueueProducer = container.get<MessageQueueProducer>(
      TYPES.MessageQueue
    );
  }

  @Mutation(() => PointerUpdateResponse)
  @UseMiddleware(isAuth)
  async updateLastSeenMessage(
    @Arg("conversationId", () => String) conversationId: string,
    @Arg("messageId", () => String) messageId: string,
    @Ctx() ctx: Context
  ): Promise<PointerUpdateResponse> {
    try {
      const userId = ctx.req.session.userId;
      await this.messageQueueProducer.enqueueMessageSeenUpdate({
        userId,
        conversationId,
        messageId,
      });
      return {
        statusCode: StatusCodes.ACCEPTED,
        message: "Enqueued update last seen message.",
        data: true,
      };
    } catch (error) {
      this.logger.error(
        `Error enqueuing last seen message update: ${error.message}`
      );
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }

  @Mutation(() => PointerUpdateResponse)
  @UseMiddleware(isAuth)
  async updateLastReceivedMessage(
    @Arg("conversationId", () => String) conversationId: string,
    @Arg("messageId", () => String) messageId: string,
    @Ctx() ctx: Context
  ): Promise<PointerUpdateResponse> {
    try {
      const userId = ctx.req.session.userId;
      const result = await this.updateLastReceivedMessageUseCase.execute({
        userId,
        conversationId,
        messageId,
      });

      if (result.error) {
        this.logger.error(
          `Error updating last received message: ${result.error}`
        );
        return {
          statusCode: StatusCodes.BAD_REQUEST,
          error: result.error || "Failed to update last received message.",
        };
      }

      return {
        statusCode: StatusCodes.OK,
        message: "Updated last received message successfully!",
        data: result.data,
      };
    } catch (error) {
      this.logger.error(
        `Error updating last received message: ${error.message}`
      );
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }

  @Mutation(() => DetailedParticipantResponse)
  @UseMiddleware(isAuth)
  async createParticipant(
    @Arg("request", () => ParticipantCreateMutationRequest)
    request: ICreateParticipantRequestDTO,
    @Ctx()
    {
      req: {
        session: { userId },
      },
    }: Context
  ): Promise<DetailedParticipantResponse> {
    try {
      const participant = await this.addParticipantAndNotifyUseCase.execute({
        ...request,
        currentUserId: userId,
      });

      if (participant.error || !participant.data) {
        this.logger.error(`Error adding participant: ${participant.error}`);
        return {
          statusCode: StatusCodes.NOT_FOUND,
          error: "Failed to adding new participant",
        };
      }

      return {
        statusCode: StatusCodes.CREATED,
        message: "Participant added successfully!",
        data: participant.data,
      };
    } catch (error) {
      this.logger.error(`Error adding participant: ${error.message}`);
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }

  @Mutation(() => BatchUpdateResponse)
  @UseMiddleware(isAuth)
  async batchUpdateLastReceivedMessages(
    @Arg("request", () => [BatchUpdateLastReceivedMessageRequest])
    request: BatchUpdateLastReceivedMessageRequest[],
    @Ctx() ctx: Context
  ): Promise<BatchUpdateResponse> {
    try {
      const result = await this.batchUpdateLastReceivedMessagesUseCase.execute(
        {
          userId: ctx.req.session.userId,
          items: request.map(({ conversationId, messageId }) => ({
            conversationId,
            messageId,
          })),
        }
      );

      if (result.error || !result.data) {
        this.logger.error(
          `Error batch updating last received messages: ${result.error}`
        );
        return {
          statusCode: StatusCodes.BAD_REQUEST,
          error:
            result.error || "Failed to batch update last received messages.",
        };
      }

      return {
        statusCode: StatusCodes.OK,
        message: "Batch updated last received messages successfully!",
        data: result.data,
      };
    } catch (error) {
      this.logger.error(
        `Error batch updating last received messages: ${error.message}`
      );
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }

  @Mutation(() => BatchUpdateResponse)
  @UseMiddleware(isAuth)
  async batchUpdateAllBehindConversations(@Ctx() ctx: Context) {
    try {
      const userId = ctx.req.session.userId;
      await this.messageQueueProducer.enqueueFindAndBatchUpdateLastReceivedMessages(
        userId
      );

      return {
        statusCode: StatusCodes.ACCEPTED,
        message: "Message queued for batching update",
        data: true,
      };
    } catch (error) {
      this.logger.error(
        `Error batch updating all behind conversations: ${error.message}`
      );
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }

  @Subscription(() => [LastReceivedMessageUpdateBodyDTO], {
    topics: Topic.UPDATE_LAST_RECEIVED_MESSAGE,
    filter: isRecipient,
  })
  updateLastReceivedMessageSubscription(
    @Root() payload: PublishLastMessageReceivedEvent
  ): LastReceivedMessageUpdateBodyDTO[] {
    try {
      return payload.updates;
    } catch (error) {
      this.logger.error(
        `Error in subscription updateLastReceivedMessage: ${error.message}`
      );
      return null;
    }
  }

  @Subscription(() => LastSeenMessageUpdateBodyDTO, {
    topics: Topic.UPDATE_LAST_SEEN_MESSAGE,
    filter: isRecipient,
  })
  updateLastSeenMessageSubscription(
    @Root() payload: PublishLastMessageSeenPayload
  ): LastSeenMessageUpdateBodyDTO {
    try {
      return payload;
    } catch (error) {
      this.logger.error(
        `Error in subscription updateLastSeenMessage: ${error.message}`
      );
      return null;
    }
  }
}
