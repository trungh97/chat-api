import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaClientProvider } from "./PrismaClientProvider";
import { PrismaTransactionManager } from "./PrismaTransactionManager";

describe("PrismaTransactionManager", () => {
  const tx = { name: "tx" } as unknown as Prisma.TransactionClient;
  let $transaction: jest.Mock;
  let root: PrismaClient;
  let provider: PrismaClientProvider;
  let manager: PrismaTransactionManager;

  beforeEach(() => {
    // Calls the callback with a fake transaction client, like Prisma does.
    $transaction = jest.fn(
      async (fn: (client: Prisma.TransactionClient) => Promise<unknown>) =>
        fn(tx)
    );
    root = { $transaction } as unknown as PrismaClient;
    provider = new PrismaClientProvider(root);
    manager = new PrismaTransactionManager(provider);
  });

  it("gives repositories the root client outside a transaction", () => {
    expect(provider.client).toBe(root);
    expect(provider.inTransaction).toBe(false);
  });

  it("gives repositories the transaction client inside run, and the root client after it", async () => {
    const seen = await manager.run(async () => provider.client);

    expect(seen).toBe(tx);
    expect(provider.client).toBe(root);
  });

  it("keeps the transaction client across awaits inside run", async () => {
    const seen = await manager.run(async () => {
      await new Promise((resolve) => setImmediate(resolve));
      return provider.client;
    });

    expect(seen).toBe(tx);
  });

  it("reuses the open transaction for a nested run", async () => {
    const seen = await manager.run(() => manager.run(async () => provider.client));

    expect(seen).toBe(tx);
    expect($transaction).toHaveBeenCalledTimes(1);
  });

  it("returns what the callback returns", async () => {
    await expect(manager.run(async () => 42)).resolves.toBe(42);
  });

  it("passes the callback's error on, so Prisma rolls back", async () => {
    await expect(
      manager.run(async () => {
        throw new Error("abort");
      })
    ).rejects.toThrow("abort");
    expect(provider.client).toBe(root);
  });
});
