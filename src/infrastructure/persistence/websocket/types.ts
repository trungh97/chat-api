import { Conversation, Message } from "@domain/entities";
import { Topic } from "./topics";

export class MessageWithConversation extends Message {
  private _conversation: Conversation;
  private _senderName: string;
  private _senderAvatar: string | null;

  get conversation(): Conversation {
    return this._conversation;
  }

  get senderName(): string {
    return this._senderName;
  }

  get senderAvatar(): string | null {
    return this._senderAvatar;
  }

  constructor(
    message: Message,
    conversation: Conversation,
    senderName: string,
    senderAvatar: string | null
  ) {
    super(message);
    this._conversation = conversation;
    this._senderName = senderName;
    this._senderAvatar = senderAvatar;
  }
}

export type PubSubProps = {
  [Topic.NEW_MESSAGE]: [MessageWithConversation];
};
