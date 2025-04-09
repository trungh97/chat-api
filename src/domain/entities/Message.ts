import {
  ICreateMessageRequestDTO
} from "@domain/dtos/message";
import { MessageType } from "@domain/enums";
import sanitize from "sanitize-html";
import { v4 as uuid } from "uuid";

export interface MessageProps {
  id: string;
  senderId?: string;
  conversationId: string;
  content: string;
  extra?: Object;
  messageType: keyof typeof MessageType;
  replyToMessageId?: string;
  createdAt: Date;
}

export class Message {
  private readonly _id: string;
  private _senderId: string;
  private _conversationId: string;
  private _content: string;
  private _extra: Object;
  private _messageType: keyof typeof MessageType;
  private _replyToMessageId: string;
  private _createdAt: Date;

  constructor({
    id,
    senderId,
    conversationId,
    content,
    extra,
    messageType,
    replyToMessageId,
  }: MessageProps) {
    this._id = id;
    this._senderId = senderId;
    this._conversationId = conversationId;
    this._content = content;
    this._extra = extra;
    this._messageType = messageType;
    this._replyToMessageId = replyToMessageId;
    this._createdAt = new Date();
  }

  get id(): string {
    return this._id;
  }

  get senderId(): string {
    return this._senderId;
  }

  set senderId(senderId: string) {
    this._senderId = senderId;
  }

  get conversationId(): string {
    return this._conversationId;
  }

  set conversationId(conversationId: string) {
    this._conversationId = conversationId;
  }

  get content(): string {
    return this._content;
  }

  set content(content: string) {
    this._content = content;
  }

  get extra(): Object {
    return this._extra;
  }

  set extra(extra: Object) {
    this._extra = extra;
  }

  get messageType(): keyof typeof MessageType {
    return this._messageType;
  }

  set messageType(messageType: keyof typeof MessageType) {
    this._messageType = messageType;
  }

  get replyToMessageId(): string {
    return this._replyToMessageId;
  }

  set replyToMessageId(replyToMessageId: string) {
    this._replyToMessageId = replyToMessageId;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  set createdAt(createdAt: Date) {
    this._createdAt = createdAt;
  }

  static async create(
    request: ICreateMessageRequestDTO,
    currentUserId: string
  ): Promise<Message> {
    const newMessage = {
      id: uuid(),
      senderId: currentUserId,
      conversationId: request.conversationId,
      content: sanitize(request.content, {
        allowedTags: [],
        allowedAttributes: {},
      }),
      extra: request?.extra,
      messageType: request.messageType,
      replyToMessageId: request.replyToMessageId,
      createdAt: new Date(),
    };

    return new Message(newMessage);
  }
}
