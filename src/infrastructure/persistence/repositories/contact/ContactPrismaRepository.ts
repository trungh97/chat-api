import { Contact } from "@domain/entities";
import { ICursorBasedPaginationResponse } from "@domain/interfaces/pagination/CursorBasedPagination";
import { IContactRepository } from "@domain/repositories";
import { TYPES } from "@infrastructure/external/di/inversify";
import { Contact as ContactPrismaModel, PrismaClient } from "@prisma/client";
import { PAGE_LIMIT } from "@shared/constants";
import { ILogger } from "@shared/logger";
import { RepositoryResponse } from "@shared/responses";
import { inject, injectable } from "inversify";

@injectable()
export class ContactPrismaRepository implements IContactRepository {
  constructor(
    @inject(TYPES.PrismaClient) private prisma: PrismaClient,
    @inject(TYPES.WinstonLogger) private logger: ILogger
  ) {}

  private toDomainFromPersistence(
    contactPrismaModel: ContactPrismaModel
  ): Contact {
    return new Contact(contactPrismaModel);
  }

  async getContactById(
    id: string
  ): Promise<RepositoryResponse<Contact, Error>> {
    try {
      const contact = await this.prisma.contact.findUnique({
        where: { id },
      });

      if (!contact) {
        return {
          value: null,
          error: new Error(`Contact with id ${id} not found`),
        };
      }
      return {
        value: this.toDomainFromPersistence(contact),
      };
    } catch (e) {
      this.logger.error(`Error fetching contact by id ${id}: ${e.message}`);
      return {
        error: new Error(`Error fetching contact by id ${id}`),
        value: null,
      };
    }
  }

  async getContactByUserIdAndContactId(
    userId: string,
    contactId: string
  ): Promise<RepositoryResponse<Contact, Error>> {
    try {
      const contact = await this.prisma.contact.findFirst({
        where: {
          userId,
          contactId,
        },
      });

      if (!contact) {
        return {
          value: null,
          error: new Error(
            `Contact with userId ${userId} and contactId ${contactId} not found`
          ),
        };
      }

      return {
        value: this.toDomainFromPersistence(contact),
      };
    } catch (e) {
      this.logger.error(
        `Error fetching contact by userId ${userId} and contactId ${contactId}: ${e.message}`
      );
      return {
        error: new Error(
          `Error fetching contact by userId ${userId} and contactId ${contactId}`
        ),
        value: null,
      };
    }
  }

  async getContactsByUserId(
    userId: string,
    cursor?: string,
    limit = PAGE_LIMIT
  ): Promise<
    RepositoryResponse<ICursorBasedPaginationResponse<Contact>, Error>
  > {
    try {
      const contacts = await this.prisma.contact.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        where: { userId },
        orderBy: {
          createdAt: "desc",
        },
      });

      const nextCursor =
        contacts.length > limit ? contacts[limit].id : undefined;

      return {
        value: {
          data: contacts.slice(0, limit).map(this.toDomainFromPersistence),
          nextCursor,
        },
      };
    } catch (e) {
      this.logger.error(
        `Error fetching contacts by userId ${userId}: ${e.message}`
      );
      return {
        error: new Error(`Error fetching contacts by userId ${userId}`),
        value: null,
      };
    }
  }

  async createContact(
    contact: Contact
  ): Promise<RepositoryResponse<Contact, Error>> {
    try {
      const newContact = await this.prisma.contact.create({
        data: {
          id: contact.id,
          userId: contact.userId,
          contactId: contact.contactId,
        },
      });
      return {
        value: this.toDomainFromPersistence(newContact),
      };
    } catch (e) {
      this.logger.error(`Error creating contact: ${e.message}`);
      return {
        value: null,
        error: new Error(`Error creating contact: ${e.message}`),
      };
    }
  }

  async updateContact(
    contact: Contact
  ): Promise<RepositoryResponse<Contact, Error>> {
    try {
      const updatedContact = await this.prisma.contact.update({
        where: { id: contact.id },
        data: {
          userId: contact.userId,
          contactId: contact.contactId,
        },
      });
      return {
        value: this.toDomainFromPersistence(updatedContact),
      };
    } catch (e) {
      this.logger.error(
        `Error updating contact with id ${contact.id}: ${e.message}`
      );
      return {
        value: null,
        error: new Error(`Error updating contact with id ${contact.id}`),
      };
    }
  }

  async deleteContact(id: string): Promise<RepositoryResponse<boolean, Error>> {
    try {
      await this.prisma.contact.delete({ where: { id } });
      return {
        value: true,
      };
    } catch (e) {
      this.logger.error(`Error deleting contact with id ${id}: ${e.message}`);
      return {
        value: false,
        error: new Error(`Error deleting contact with id ${id}`),
      };
    }
  }
}
