import { ICreateConversationRequestDTO } from "@domain/dtos/conversation";
import { ConversationType } from "@domain/enums";
import { v4 as uuid } from "uuid";

export interface ConversationProps {
  id: string;
  title: string;
  creatorId: string;
  isArchived: boolean;
  deletedAt: Date;
  type: ConversationType;
}

export class Conversation {
  private readonly _id: string;
  private _title: string;
  private _creatorId: string;
  private _isArchived: boolean;
  private _deletedAt: Date;
  private _type: ConversationType;

  constructor(props: ConversationProps) {
    this._id = props.id;
    this._title = props.title;
    this._creatorId = props.creatorId;
    this._isArchived = props.isArchived;
    this._deletedAt = props.deletedAt;
    this._type = props.type;
  }

  get id(): string {
    return this._id;
  }

  get title(): string {
    return this._title;
  }

  set title(title: string) {
    if (title.length < 3)
      throw new Error("Title must be at least 3 characters");
    this._title = title;
  }

  get creatorId(): string {
    return this._creatorId;
  }

  set creatorId(creatorId: string) {
    this._creatorId = creatorId;
  }

  get isArchived(): boolean {
    return this._isArchived;
  }

  set isArchived(isArchived: boolean) {
    this._isArchived = isArchived;
  }

  get deletedAt(): Date {
    return this._deletedAt;
  }

  set deletedAt(deletedAt: Date) {
    this._deletedAt = deletedAt;
  }

  get type(): ConversationType {
    return this._type;
  }

  set type(type: ConversationType) {
    this._type = type;
  }

  static async create(
    userId: string,
    request: ICreateConversationRequestDTO
  ): Promise<Conversation> {
    const newConversation = {
      id: uuid(),
      title: request.title || null,
      creatorId: userId,
      isArchived: false,
      deletedAt: null,
      type: request.type,
    };

    return new Conversation(newConversation);
  }
}
