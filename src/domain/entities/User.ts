import { ICreateUserRequestDTO } from "@domain/dtos/user";
import { UserRole, UserStatus } from "@domain/enums";
import { Email } from "@domain/valueObjects";
import { hashPassword } from "@infrastructure/persistence/utils/jwt";
import { PhoneRegex } from "@shared/constants";
import { v4 as uuid } from "uuid";

export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: keyof typeof UserRole;
  avatar: string;
  password: string;
  isActive: boolean;
  status: keyof typeof UserStatus;
}

export class User {
  private readonly _id: string;
  private _email: string;
  private _firstName: string;
  private _lastName: string;
  private _phone: string;
  private _role: keyof typeof UserRole;
  private _avatar: string;
  private _password: string;
  private _isActive: boolean;
  private _status: keyof typeof UserStatus;

  constructor(props: IUser) {
    this._id = props.id;
    this._email = props.email;
    this._firstName = props.firstName;
    this._lastName = props.lastName;
    this._phone = props.phone;
    this._role = props.role;
    this._avatar = props.avatar;
    this._password = props.password;
    this._isActive = props.isActive;
    this._status = props.status;
  }

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
   * @param {Email} email - The user email
   *
   * @throws {Error} If the email is invalid
   */
  set email(email: string) {
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
   * Get the user's role
   *
   * @readonly
   * @returns {keyof typeof UserRole} The user's role (ADMIN or USER)
   */
  get role(): keyof typeof UserRole {
    return this._role;
  }

  /**
   * Set the user's role
   *
   * @param {string} role - The user's role (ADMIN or USER)
   */
  set role(role: UserRole) {
    this._role = role;
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
   * Get the user's password
   *
   * @readonly
   * @returns {string} The user's password
   */
  get password(): string {
    return this._password;
  }

  /**
   * Set the user's password
   *
   * @param {string} password - The user's password
   */
  set password(password: string) {
    this._password = password;
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
   * @returns {keyof typeof UserStatus} The user's current status
   */
  get status(): keyof typeof UserStatus {
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

  static async create(request: ICreateUserRequestDTO): Promise<User> {
    const email = new Email({ address: request.email });

    const hashedPassword = await hashPassword(request.password);

    const newUser = {
      id: uuid(),
      email: email.address,
      firstName: request.firstName,
      lastName: request.lastName,
      phone: request.phone,
      role: UserRole.USER,
      avatar: request.avatar,
      password: hashedPassword,
      isActive: true,
      status: UserStatus.ONLINE,
    };

    return new User(newUser);
  }
}
