import { ICreateParticipantRequestDTO } from "@domain/dtos/participant";
import { ParticipantType } from "@domain/enums";
import { v4 as uuid } from "uuid";

export interface ParticipantProps {
  id: string;
  userId: string;
  conversationId: string;
  type: ParticipantType;
}
export class Participant {
  private readonly _id: string;
  private _userId: string;
  private _conversationId: string;
  private _type: ParticipantType;

  constructor({ id, userId, conversationId, type }: ParticipantProps) {
    this._id = id;
    this._userId = userId;
    this._conversationId = conversationId;
    this._type = type;
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

  get type(): ParticipantType {
    return this._type;
  }

  set type(value: ParticipantType) {
    this._type = value;
  }

  static async create(
    request: ICreateParticipantRequestDTO
  ): Promise<Participant> {
    const newParticipant = {
      id: uuid(),
      userId: request.userId,
      conversationId: request.conversationId,
      type: request.type as ParticipantType,
    };

    return new Participant(newParticipant);
  }
}

export class ParticipantWithName extends Participant {
  private _name: string;

  constructor(participant: Participant, name: string) {
    super(participant);
    this._name = name;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }
}
