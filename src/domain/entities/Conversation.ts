import { ICreateConversationRequestDTO } from "@domain/dtos";
import { ConversationType } from "@domain/enums";
import { v4 as uuid } from "uuid";

export interface ConversationProps {
  id: string;
  title: string;
  creatorId: string;
  isArchived: boolean;
  deletedAt: Date;
  type: keyof typeof ConversationType;
  groupAvatar?: string;
  lastMessageAt?: Date;
}

export class Conversation {
  private readonly _id: string;
  private _title: string;
  private _creatorId: string;
  private _isArchived: boolean;
  private _deletedAt: Date;
  private _type: keyof typeof ConversationType;
  private _groupAvatar?: string;
  private _lastMessageAt?: Date;

  constructor(props: ConversationProps) {
    this._id = props.id;
    this._title = props.title;
    this._creatorId = props.creatorId;
    this._isArchived = props.isArchived;
    this._deletedAt = props.deletedAt;
    this._type = props.type;
    this._groupAvatar = props.groupAvatar;
    this._lastMessageAt = props.lastMessageAt;
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

  get type(): keyof typeof ConversationType {
    return this._type;
  }

  set type(type: keyof typeof ConversationType) {
    this._type = type;
  }

  get groupAvatar(): string | undefined {
    return this._groupAvatar;
  }

  set groupAvatar(groupAvatar: string | undefined) {
    this._groupAvatar = groupAvatar;
  }

  get lastMessageAt(): Date | undefined {
    return this._lastMessageAt;
  }

  set lastMessageAt(lastMessageAt: Date | undefined) {
    this._lastMessageAt = lastMessageAt;
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
      type: ConversationType.PRIVATE,
      lastMessageAt: request.lastMessageAt || null,
    };

    return new Conversation(newConversation);
  }
}
