import { GetMessageByIdUseCase } from "./get-message-by-id.impl";

describe("GetMessageByIdUseCase", () => {
  let messageRepository: any;
  let logger: any;
  let useCase: GetMessageByIdUseCase;

  beforeEach(() => {
    messageRepository = {
      getMessageById: jest.fn(),
    };
    logger = { error: jest.fn() };
    useCase = new GetMessageByIdUseCase(messageRepository, logger);
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

  it("returns success if found and user is sender", async () => {
    messageRepository.getMessageById.mockResolvedValue({
      value: {
        senderId: "u1",
        id: "1",
        content: "hi",
        sender: {
          firstName: "John",
          lastName: "Doe",
          avatar: null,
        },
      },
      error: null,
    });
    const result = await useCase.execute({ id: "1", userId: "u1" });
    expect(result.data).toBeTruthy();
    expect(result.error).toBeUndefined();
  });

  it("returns internal error if the result value is missing fields", async () => {
    messageRepository.getMessageById.mockResolvedValue({
      value: {
        senderId: "u1",
        id: "1",
        content: "hi",
      },
      error: null,
    });
    const result = await useCase.execute({ id: "1", userId: "u1" });
    expect(result.data).toBeNull();
    expect(result.error).toContain(
      "Error executing get message by id use case:"
    );
  });
});
