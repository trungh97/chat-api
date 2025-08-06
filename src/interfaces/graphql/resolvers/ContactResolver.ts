import {
  ICreateContactUseCase,
  IDeleteContactUseCase,
  IFindContactByIdUseCase,
  IGetContactsByUserIdUseCase,
} from "@application/usecases/contact";
import { container, TYPES } from "@infrastructure/external/di/inversify/types";
import { ILogger } from "@shared/logger";
import { GlobalResponse } from "@shared/responses";
import { StatusCodes } from "http-status-codes";
import { Arg, Ctx, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { Context } from "types";
import { ContactDTO } from "../dtos";
import { ContactMapper } from "../mappers";
import { ContactCreateMutationRequest } from "../types/contact";

const ContactResponseObjectType = GlobalResponse(ContactDTO);
const ContactListResponseObjectType = GlobalResponse(ContactDTO, true);

@ObjectType()
class ContactResponse extends ContactResponseObjectType {}

@ObjectType()
class ContactListResponse extends ContactListResponseObjectType {}

@Resolver()
export class ContactResolver {
  private createContactUseCase: ICreateContactUseCase;
  private findContactByIdUseCase: IFindContactByIdUseCase;
  private getContactsByUserIdUseCase: IGetContactsByUserIdUseCase;
  private deleteContactByIdUseCase: IDeleteContactUseCase;
  private logger: ILogger;

  constructor() {
    this.createContactUseCase = container.get<ICreateContactUseCase>(
      TYPES.CreateContactUseCase
    );
    this.findContactByIdUseCase = container.get<IFindContactByIdUseCase>(
      TYPES.FindContactByIdUseCase
    );
    this.getContactsByUserIdUseCase =
      container.get<IGetContactsByUserIdUseCase>(
        TYPES.GetContactsByUserIdUseCase
      );
    this.deleteContactByIdUseCase = container.get<IDeleteContactUseCase>(
      TYPES.DeleteContactUseCase
    );
    this.logger = container.get<ILogger>(TYPES.WinstonLogger);
  }

  @Mutation(() => ContactResponse)
  async createContact(
    @Arg("request", () => ContactCreateMutationRequest)
    request: { contactId: string },
    @Ctx()
    {
      req: {
        session: { userId },
      },
    }: Context
  ): Promise<ContactResponse> {
    try {
      if (!userId) {
        return {
          statusCode: StatusCodes.UNAUTHORIZED,
          error: "User is not authenticated",
        };
      }

      const contact = await this.createContactUseCase.execute({
        ...request,
        userId,
      });

      if (contact.error || !contact.data) {
        this.logger.error(`Error creating contact: ${contact.error}`);
        return {
          statusCode: StatusCodes.NOT_FOUND,
          error: "Failed to create new contact",
        };
      }

      return {
        statusCode: StatusCodes.CREATED,
        message: "Contact created successfully!",
        data: ContactMapper.toDTO(contact.data),
      };
    } catch (error) {
      this.logger.error(`Error creating contact: ${error.message}`);
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }

  @Query(() => ContactListResponse)
  async getContactsByUserId(
    @Ctx()
    {
      req: {
        session: { userId },
      },
    }: Context
  ): Promise<ContactListResponse> {
    try {
      if (!userId) {
        return {
          statusCode: StatusCodes.UNAUTHORIZED,
          error: "User is not authenticated",
        };
      }

      const result = await this.getContactsByUserIdUseCase.execute(userId);

      if (result.error) {
        return {
          statusCode: StatusCodes.NOT_FOUND,
          error: "Failed to fetch the contact list!",
        };
      }

      const { data: contacts } = result;

      return {
        statusCode: StatusCodes.OK,
        data: contacts.map(ContactMapper.toDTO),
      };
    } catch (error) {
      this.logger.error(
        `Error getting contact list of userId ${userId}: ${error.message}`
      );
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }
}
