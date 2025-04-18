import { ICreateParticipantRequestDTO } from "@domain/dtos/participant";
import { ParticipantType } from "@domain/enums";
import { v4 as uuid } from "uuid";

export interface ParticipantProps {
  id: string;
  userId: string;
  conversationId: string;
  type: keyof typeof ParticipantType;
  customTitle?: string;
}
export class Participant {
  private readonly _id: string;
  private _userId: string;
  private _conversationId: string;
  private _type: keyof typeof ParticipantType;
  private _customTitle?: string;

  constructor({
    id,
    userId,
    conversationId,
    type,
    customTitle,
  }: ParticipantProps) {
    this._id = id;
    this._userId = userId;
    this._conversationId = conversationId;
    this._type = type;
    this._customTitle = customTitle;
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
