import { Conversation, Message, Participant } from "@domain/entities";

export type PublishMessageSentPayload = {
  message: Message;
  sender: {
    name: string;
    avatar: string;
  };
  conversation: Conversation;
  /** User ids of the conversation's participants; only they receive the event. */
  recipientUserIds: string[];
};

export type PublishLastMessageReceivedPayload = {
  conversationId: string;
  messageId: Message["id"];
  messageCreatedAt: Date;
  participantId: Participant["id"];
};

/** Last received updates for a single conversation. */
export type PublishLastMessageReceivedEvent = {
  /** User ids of the conversation's participants; only they receive the event. */
  recipientUserIds: string[];
  updates: PublishLastMessageReceivedPayload[];
};

export type PublishLastMessageSeenPayload =
  PublishLastMessageReceivedPayload & {
    lastSeenAt: Date;
    /** User ids of the conversation's participants; only they receive the event. */
    recipientUserIds: string[];
  };

export type PublishMessageStatusErrorPayload = {
  status: Message["status"];
};

export type PublishPresenseUpdatePayload = {
  userId: string;
  isOnline: boolean;
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
   * Publishes updates to the received status of messages in a single conversation. Only the
   * conversation's participants (`recipientUserIds`) receive the event.
   * @param event The recipients and the participant pointer updates for one conversation.
   * @returns A Promise that resolves when the message has been published.
   */
  publishLastReceivedMessageUpdated(
    event: PublishLastMessageReceivedEvent
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

  publishPresenseUpdate(payload: PublishPresenseUpdatePayload): Promise<void>;
}
