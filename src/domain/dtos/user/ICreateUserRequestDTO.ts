import { UserProvider } from "@domain/enums";

export interface ICreateUserRequestDTO {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  password?: string;
  provider?: keyof typeof UserProvider;
  providerUserId?: string;
}
