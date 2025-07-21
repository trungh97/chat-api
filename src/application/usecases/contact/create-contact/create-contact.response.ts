import { Contact, ContactProps } from "@domain/entities";

export class IContactResponseDTO extends Contact {
  private _contactName: string;

  constructor({
    id,
    userId,
    contactId,
    contactName,
  }: ContactProps & { contactName: string }) {
    super({ id, userId, contactId });
    this._contactName = contactName;
  }

  get contactName(): string {
    return this._contactName;
  }

  set contactName(contactName: string) {
    this._contactName = contactName;
  }
}
