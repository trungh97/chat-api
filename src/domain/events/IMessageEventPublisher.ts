import { Conversation, Message, Participant } from "@domain/entities";

export type PublishMessageSentPayload = {
  message: Message;
  sender: {
    name: string;
    avatar: string;
  };
  conversation: Conversation;
};

export type PublishLastMessageReceivedPayload = {
  messageId: Message["id"];
  participantId: Participant["id"];
};

export type PublishLastMessageSeenPayload =
  PublishLastMessageReceivedPayload & { lastSeenAt: Date };

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
   * Publishes an update to the received status of a message in a conversation. This method is used to publish
   * the update to all connected clients that are subscribed to the conversation.
   * @param payload The payload containing the message ID, conversation ID, and participant ID.
   * @returns A Promise that resolves when the message has been published.
   */
  publishLastReceivedMessageUpdated(
    payload: PublishLastMessageReceivedPayload[]
  ): Promise<void>;

  /**
   * Publishes an update to the seen status of a message in a conversation. This method is used to publish
   * the update to all connected clients that are subscribed to the conversation.
   * @param payload The payload containing the message ID, conversation ID, and participant ID.
   * @returns A Promise that resolves when the message has been published.
   */
  publishLastSeenMessageUpdated(
    payload: PublishLastMessageSeenPayload
  ): Promise<void>;
}
