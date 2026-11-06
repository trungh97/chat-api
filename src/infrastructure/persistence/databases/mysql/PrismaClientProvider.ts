import { TYPES } from "@infrastructure/external/di/inversify/types";
import { Prisma, PrismaClient } from "@prisma/client";
import { AsyncLocalStorage } from "async_hooks";
import { inject, injectable } from "inversify";

/**
 * Gives repositories the Prisma client to use: the transaction opened by
 * `PrismaTransactionManager` when there is one in the current async context, otherwise
 * the root client. Bind it as a singleton so every repository shares the same context.
 */
@injectable()
export class PrismaClientProvider {
  private readonly transactions = new AsyncLocalStorage<Prisma.TransactionClient>();

  constructor(@inject(TYPES.PrismaClient) private readonly root: PrismaClient) {}

  get client(): Prisma.TransactionClient {
    return this.transactions.getStore() ?? this.root;
  }

  get rootClient(): PrismaClient {
    return this.root;
  }

  get inTransaction(): boolean {
    return this.transactions.getStore() !== undefined;
  }

  /** Runs `fn` with `tx` as the client for every repository call inside it. */
  runWith<T>(tx: Prisma.TransactionClient, fn: () => Promise<T>): Promise<T> {
    return this.transactions.run(tx, fn);
  }
}
