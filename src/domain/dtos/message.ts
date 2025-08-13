import { Message } from "@domain/entities";
import { MessageType, SystemMessageType } from "@domain/enums";

export interface IBaseMessageDTO {
  id: string;
  content: string;
  messageType: keyof typeof MessageType;
  senderId?: string;
  extra?: string;
  conversationId: string;
  replyToMessageId?: string;
  createdAt: Date;
}

export interface ICreateMessageRequestDTO {
  conversationId: string | null;
  content: string;
  extra?: Object;
  messageType: keyof typeof MessageType;
  replyToMessageId?: string;
  receivers?: string[];
}

export interface ICreateSystemMessageRequestDTO {
  conversationId: string;
  systemMessageType: keyof typeof SystemMessageType;
  relatedUser?: string;
}

type SenderProps = {
  firstName: string;
  lastName: string;
  avatar?: string | null;
};

export class MessageRepositoryDTO extends Message {
  private _sender: SenderProps;

  get sender(): SenderProps {
    return this._sender;
  }

  constructor(message: Message, sender: SenderProps) {
    super(message);
    this._sender = sender;
  }
}
