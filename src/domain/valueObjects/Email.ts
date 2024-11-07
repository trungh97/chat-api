import { EmailRegex } from "@shared/constants";

/**
 * Type representing the properties needed to create an Email instance.
 *
 * @interface
 */
type EmailProps = {
  address: string;
};

/**
 * Class representing an email address.
 *
 * @class
 */
export class Email {
  private _address: string;

  /**
   * Getter for the email address.
   *
   * @readonly
   * @returns {string} The email address.
   */
  get address(): string {
    return this._address;
  }

  /**
   * Creates an instance of the Email class.
   *
   * @constructor
   * @param {EmailProps} props - The properties for creating an email instance.
   * @throws {Error} Throws an error if the email address is invalid.
   */
  constructor(props: EmailProps) {
    if (props.address == null || !props.address.match(EmailRegex)) {
      throw new Error("Invalid email address");
    }
    const address = props.address.trim().toLowerCase();
    this._address = address;
  }
}
