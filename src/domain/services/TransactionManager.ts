/**
 * Runs work in one database transaction.
 */
export interface ITransactionManager {
  /**
   * Runs `fn` in a transaction. Repository calls made inside `fn` (directly or through
   * other use cases) share it. It commits when `fn` resolves and rolls back when `fn`
   * throws. A nested call reuses the transaction that is already open.
   */
  run<T>(fn: () => Promise<T>): Promise<T>;
}

/**
 * Thrown inside `ITransactionManager.run` to roll the transaction back. Its message is
 * meant to be returned to the caller as the use-case error.
 */
export class TransactionAbortError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TransactionAbortError";
  }
}
