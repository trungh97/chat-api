import { Conversation, Message } from "@domain/entities";

export interface IMessagePublisher {
  /**
   * Publishes a new message to a conversation. This method is used to publish
   * a message to all connected clients that are subscribed to the conversation.
   * @param message The message to publish.
   * @param conversation The conversation to publish the message to.
   * @returns A Promise that resolves when the message has been published.
   */
  publishNewMessage(payload: {
    message: Message;
    sender: {
      name: string;
      avatar: string;
    };
    conversation: Conversation;
  }): Promise<void>;
}
