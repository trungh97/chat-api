import { Conversation, Message } from "@domain/entities";
import {
  PublishLastMessageReceivedEvent,
  PublishLastMessageSeenPayload,
  PublishPresenseUpdatePayload,
} from "@domain/events";
import { Topic } from "./topics";

export class MessageWithConversation extends Message {
  private _conversation: Conversation;
  private _senderName: string;
  private _senderAvatar: string | null;
  /** Public so it survives JSON serialization and subscription filters can read it. */
  readonly recipientUserIds: string[];

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
    senderAvatar: string | null,
    recipientUserIds: string[]
  ) {
    super(message);
    this._conversation = conversation;
    this._senderName = senderName;
    this._senderAvatar = senderAvatar;
    this.recipientUserIds = recipientUserIds;
  }
}

export type PubSubProps = {
  [Topic.NEW_MESSAGE_SENT]: [MessageWithConversation];
  [Topic.UPDATE_LAST_RECEIVED_MESSAGE]: [PublishLastMessageReceivedEvent];
  [Topic.UPDATE_LAST_SEEN_MESSAGE]: [PublishLastMessageSeenPayload];
  [Topic.PRESENSE_UPDATE]: [PublishPresenseUpdatePayload];
};
