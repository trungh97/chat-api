export interface ICreateUserRequestDTO {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  password: string;
}
