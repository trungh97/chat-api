import { Conversation, Message } from "@domain/entities";

export type PublishMessageSentPayload = {
  message: Message;
  sender: {
    name: string;
    avatar: string;
  };
  conversation: Conversation;
};

export type PublishMessageStatusUpdatedPayload = {
  messageId: Message["id"];
  status: Message["status"];
};

export type PublishMessageStatusErrorPayload = {
  status: Message["status"];
};

export interface IMessageEventPublisher {
  /**
   * Publishes a new message with status `SENT` to a conversation. This method is used to publish
   * that message to all connected clients that are subscribed to the conversation.
   * @param message The `SENT` message to publish.
   * @returns A Promise that resolves when the message has been published.
   */
  publishMessageSent(payload: PublishMessageSentPayload): Promise<void>;

  /**
   * Publishes a message with new status to a conversation. This method is used to publish
   * a message status update to all connected clients that are subscribed to the conversation.
   * @param message The message to update.
   * @returns A Promise that resolves when the message status has been published.
   */
  publishMessageStatusUpdated(
    payload: PublishMessageStatusUpdatedPayload
  ): Promise<void>;
}
