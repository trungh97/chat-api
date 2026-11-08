import { ITransactionManager } from "@domain/services";
import { TYPES } from "@infrastructure/external/di/inversify/types";
import { inject, injectable } from "inversify";
import { PrismaClientProvider } from "./PrismaClientProvider";

@injectable()
export class PrismaTransactionManager implements ITransactionManager {
  constructor(
    @inject(TYPES.PrismaClientProvider)
    private readonly clientProvider: PrismaClientProvider
  ) {}

  run<T>(fn: () => Promise<T>): Promise<T> {
    if (this.clientProvider.inTransaction) {
      return fn();
    }

    return this.clientProvider.rootClient.$transaction((tx) =>
      this.clientProvider.runWith(tx, fn)
    );
  }
}
