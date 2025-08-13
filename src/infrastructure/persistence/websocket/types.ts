import { Conversation, Message } from "@domain/entities";
import { Topic } from "./topics";

export class MessageWithConversation extends Message {
  private _conversation: Conversation;

  get conversation(): Conversation {
    return this._conversation;
  }

  constructor(message: Message, conversation: Conversation) {
    super(message);
    this._conversation = conversation;
  }
}

export type PubSubProps = {
  [Topic.NEW_MESSAGE]: [MessageWithConversation];
};
