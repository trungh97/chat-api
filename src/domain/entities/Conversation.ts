export interface ConversationProps {
  id: string;
  title: string;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
  deletedAt: Date;
}

export class Conversation {
  private readonly _id: string;
  private _title: string;
  private _creatorId: string;
  private _createdAt: Date;
  private _updatedAt: Date;
  private _isArchived: boolean;
  private _deletedAt: Date;

  constructor(props: ConversationProps) {
    this._id = props.id;
    this._title = props.title;
    this._creatorId = props.creatorId;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
    this._isArchived = props.isArchived;
    this._deletedAt = props.deletedAt;
  }

  get id(): string {
    return this._id;
  }

  get title(): string {
    return this._title;
  }

  set title(title: string) {
    this._title = title;
  }

  get creatorId(): string {
    return this._creatorId;
  }

  set creatorId(creatorId: string) {
    this._creatorId = creatorId;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  set createdAt(createdAt: Date) {
    this._createdAt = createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  set updatedAt(updatedAt: Date) {
    this._updatedAt = updatedAt;
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
}
