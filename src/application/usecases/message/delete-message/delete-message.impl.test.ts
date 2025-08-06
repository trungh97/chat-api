import { DeleteMessageUseCase } from "./delete-message.impl";

describe("DeleteMessageUseCase", () => {
  let messageRepository: any;
  let logger: any;
  let useCase: DeleteMessageUseCase;

  beforeEach(() => {
    messageRepository = {
      getMessageById: jest.fn(),
      deleteMessage: jest.fn(),
    };
    logger = { error: jest.fn() };
    useCase = new DeleteMessageUseCase(messageRepository, logger);
  });

  it("returns error if message not found", async () => {
    messageRepository.getMessageById.mockResolvedValue({
      value: null,
      error: new Error("not found"),
    });
    const result = await useCase.execute({ id: "1", userId: "u1" });
    expect(result.data).toBeNull();
    expect(result.error).toBe("not found");
  });

  it("returns error if user is not sender", async () => {
    messageRepository.getMessageById.mockResolvedValue({
      value: { senderId: "u2" },
      error: null,
    });
    const result = await useCase.execute({ id: "1", userId: "u1" });
    expect(result.data).toBeNull();
    expect(result.error).toMatch(/permission/);
  });

  it("returns error if delete fails", async () => {
    messageRepository.getMessageById.mockResolvedValue({
      value: { senderId: "u1" },
      error: null,
    });
    messageRepository.deleteMessage.mockResolvedValue({
      value: false,
      error: new Error("fail"),
    });
    const result = await useCase.execute({ id: "1", userId: "u1" });
    expect(result.data).toBeNull();
    expect(result.error).toBe("fail");
  });

  it("returns custom error if delete fails", async () => {
    messageRepository.getMessageById.mockResolvedValue({
      value: { senderId: "u1" },
      error: null,
    });
    messageRepository.deleteMessage.mockResolvedValue({
      value: false,
      error: new Error(""),
    });
    const result = await useCase.execute({ id: "1", userId: "u1" });
    expect(result.data).toBeNull();
    expect(result.error).toBe("Fail to delete message!");
  });

  it("returns success if delete succeeds", async () => {
    messageRepository.getMessageById.mockResolvedValue({
      value: { senderId: "u1" },
      error: null,
    });
    messageRepository.deleteMessage.mockResolvedValue({
      value: true,
      error: null,
    });
    const result = await useCase.execute({ id: "1", userId: "u1" });
    expect(result.data).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("returns internal error if delete fails", async () => {
    messageRepository.getMessageById.mockResolvedValue({
      value: { senderId: "u1" },
      error: null,
    });
    messageRepository.deleteMessage.mockResolvedValue({
      value: false,
      error: new Error(""),
    });
    const result = await useCase.execute({ id: "1", userId: "" });
    expect(result.data).toBeNull();
    expect(result.error).toContain("Error executing delete message use case:");
  });
});
