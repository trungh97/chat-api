import { ICreateContactRequestDTO } from "@domain/dtos/contact";
import { v4 as uuid } from "uuid";

export interface ContactProps {
  id: string;
  userId: string;
  contactId: string;
}

export class Contact {
  private readonly _id: string;
  private _userId: string;
  private _contactId: string;

  constructor({ id, userId, contactId }: ContactProps) {
    this._id = id;
    this._userId = userId;
    this._contactId = contactId;
  }

  get id(): string {
    return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  set userId(userId: string) {
    this._userId = userId;
  }

  get contactId(): string {
    return this._contactId;
  }

  set contactId(contactId: string) {
    this._contactId = contactId;
  }

  static async create(request: ICreateContactRequestDTO): Promise<Contact> {
    const newContact = {
      id: uuid(),
      userId: request.userId,
      contactId: request.contactId,
    };

    return new Contact(newContact);
  }
}
