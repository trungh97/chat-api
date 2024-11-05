import { UserStatus } from "@domain/enums";
import { EmailRegex, PhoneRegex } from "@shared/constants";

export class User {
  constructor(
    private _id: string,
    private _email: string,
    private _firstName: string,
    private _lastName: string,
    private _phone: string,
    private _avatar: string,
    private _isActive: boolean,
    private _status: UserStatus
  ) {}

  /**
   * Get the user id
   *
   * @readonly
   * @returns {string} The user id
   */
  get id(): string {
    return this._id;
  }

  /**
   * Set the user id
   *
   * @param {string} id - The user id
   */
  set id(id: string) {
    this._id = id;
  }

  /**
   * Get the user email
   *
   * @readonly
   * @returns {string} The user email
   */
  get email(): string {
    return this._email;
  }

  /**
   * Set the user email
   *
   * @param {string} email - The user email
   *
   * @throws {Error} If the email is invalid
   */
  set email(email: string) {
    // Email Validation
    if (!EmailRegex.test(email)) {
      throw new Error("Invalid email address");
    }

    this._email = email;
  }

  /**
   * Get the user's first name
   *
   * @readonly
   * @returns {string} The user first name
   */
  get firstName(): string {
    return this._firstName;
  }

  /**
   * Set the user's first name
   *
   * @param {string} firstName - The user's first name
   */
  set firstName(firstName: string) {
    this._firstName = firstName;
  }

  /**
   * Get the user's last name
   *
   * @readonly
   * @returns {string} The user last name
   */
  get lastName(): string {
    return this._lastName;
  }

  /**
   * Set the user's last name
   *
   * @param {string} lastName - The user's last name
   */
  set lastName(lastName: string) {
    this._lastName = lastName;
  }

  /**
   * Get the user's full name
   *
   * @readonly
   * @returns {string} The user's full name, concatenated as "firstName lastName"
   */
  get fullName(): string {
    return `${this._firstName} ${this._lastName}`;
  }

  /**
   * Get the user's phone number
   *
   * @readonly
   * @returns {string} The user phone number
   */
  get phone(): string {
    return this._phone;
  }

  /**
   * Set the user's phone number
   *
   * Validates the phone number format using a regular expression.
   *
   * @param {string} phone - The user's phone number
   * @throws {Error} If the phone number is invalid
   */
  set phone(phone: string) {
    // Phone number validation
    if (!PhoneRegex.test(phone)) {
      throw new Error("Invalid phone number");
    }

    this._phone = phone;
  }

  /**
   * Get the user's avatar URL
   *
   * @readonly
   * @returns {string} The user avatar URL
   */
  get avatar(): string {
    return this._avatar;
  }

  /**
   * Set the user's avatar URL
   *
   * @param {string} avatar - The user's avatar URL
   */
  set avatar(avatar: string) {
    this._avatar = avatar;
  }

  /**
   * Get the user's status as active or inactive
   *
   * @readonly
   * @returns {boolean} If the user is active or not
   */
  get isActive(): boolean {
    return this._isActive;
  }

  /**
   * Set the user's status as active or inactive
   *
   * @param {boolean} isActive - If the user is active or not
   */
  set isActive(isActive: boolean) {
    this._isActive = isActive;
  }

  /**
   * Get the user's current status
   *
   * @readonly
   * @returns {UserStatus} The user's current status
   */
  get status(): UserStatus {
    return this._status;
  }

  /**
   * Set the user's status
   *
   * @param {UserStatus} status - The user's status
   */
  set status(status: UserStatus) {
    this._status = status;
  }
}
