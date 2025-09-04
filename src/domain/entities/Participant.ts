import { ICreateParticipantRequestDTO } from "@domain/dtos/participant";
import { ParticipantType } from "@domain/enums";
import { v4 as uuid } from "uuid";

export interface ParticipantProps {
  id: string;
  userId: string;
  conversationId: string;
  type: keyof typeof ParticipantType;
  customTitle?: string;
  lastSeenAt?: Date;
  lastSeenMessageId?: string;
}
export class Participant {
  private readonly _id: string;
  private _userId: string;
  private _conversationId: string;
  private _type: keyof typeof ParticipantType;
  private _customTitle?: string;
  private _lastSeenAt?: Date;
  private _lastSeenMessageId?: string;

  constructor({
    id,
    userId,
    conversationId,
    type,
    customTitle,
    lastSeenAt,
    lastSeenMessageId,
  }: ParticipantProps) {
    this._id = id;
    this._userId = userId;
    this._conversationId = conversationId;
    this._type = type;
    this._customTitle = customTitle;
    this._lastSeenAt = lastSeenAt;
    this._lastSeenMessageId = lastSeenMessageId;
  }

  get id(): string {
    return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  set userId(value: string) {
    this._userId = value;
  }

  get conversationId(): string {
    return this._conversationId;
  }

  set conversationId(value: string) {
    this._conversationId = value;
  }

  get type(): keyof typeof ParticipantType {
    return this._type;
  }

  set type(value: ParticipantType) {
    this._type = value;
  }

  get customTitle(): string | undefined {
    return this._customTitle;
  }

  set customTitle(value: string | undefined) {
    this._customTitle = value;
  }

  get lastSeenAt(): Date | undefined {
    return this._lastSeenAt;
  }

  set lastSeenAt(value: Date | undefined) {
    this._lastSeenAt = value;
  }

  get lastSeenMessageId(): string | undefined {
    return this._lastSeenMessageId;
  }

  set lastSeenMessageId(value: string | undefined) {
    this._lastSeenMessageId = value;
  }

  static async create({
    userId,
    conversationId,
    type,
    customTitle,
  }: ICreateParticipantRequestDTO): Promise<Participant> {
    const newParticipant = {
      id: uuid(),
      userId,
      conversationId,
      type,
      customTitle,
    };

    return new Participant(newParticipant);
  }
}
