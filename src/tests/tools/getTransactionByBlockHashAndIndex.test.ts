import { getTransactionByBlockHashAndIndex } from "../../tools/ethereum/getTransactionByBlockHashAndIndex";

global.fetch = jest.fn();

describe("getTransactionByBlockHashAndIndex", () => {
  const blockHash =
    "0xb3b20624f8f0f86eb50dd04688409e5cea4bd02d700bf6e79e9384d47d6a5a35";
  const index = "0x0";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("fetches transaction successfully", async () => {
    const mockTx = {
      hash: "0x24ea08c3b1bc777a23d0373dd3f8a980455c7817d814c5f34df5a3e3caf5c9a1",
      from: "0x1f9090aae28b8a3dceadf281b0f12828e676c326",
      to: "0x388c818ca8b9251b393131c08a736a67ccb19297",
      blockHash,
      transactionIndex: index,
    };

    const mockResponse = { json: async () => ({ result: mockTx }) } as Response;
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockResponse);

    const result = await getTransactionByBlockHashAndIndex.handler({ blockHash, index });

    expect(result.content?.[0]?.text).toContain("Transaction for block");
    expect(result.content?.[1]?.text).toContain(mockTx.hash);
  });

  it("returns message when transaction not found", async () => {
    const mockResponse = { json: async () => ({ result: null }) } as Response;
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockResponse);

    const result = await getTransactionByBlockHashAndIndex.handler({ blockHash, index });
    expect(result.content?.[0]?.text).toContain("No transaction found");
  });

  it("handles unsupported chain ID", async () => {
    const result = await getTransactionByBlockHashAndIndex.handler({
      blockHash,
      index,
      chainid: 9999,
    });
    expect(result.content?.[0]?.text).toContain("Unsupported chain ID: 9999");
  });

  it("handles RPC error response", async () => {
    const mockResponse = { json: async () => ({ error: { message: "transaction not found" } }) } as Response;
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockResponse);

    const result = await getTransactionByBlockHashAndIndex.handler({ blockHash, index });
    expect(result.content?.[0]?.text).toContain("Error fetching transaction: transaction not found");
  });

  it("handles unknown RPC response (no result, no error)", async () => {
    const mockResponse = { json: async () => ({}) } as Response;
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockResponse);

    const result = await getTransactionByBlockHashAndIndex.handler({ blockHash, index });
    expect(result.content?.[0]?.text).toContain("Error fetching transaction: Unknown error");
  });

  it("handles network errors", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(new Error("Network down"));

    const result = await getTransactionByBlockHashAndIndex.handler({ blockHash, index });
    expect(result.content?.[0]?.text).toContain("Error fetching transaction: Network down");
  });
});

describe("getTransactionByBlockHashAndIndex error variations", () => {
  const blockHash =
    "0xb3b20624f8f0f86eb50dd04688409e5cea4bd02d700bf6e79e9384d47d6a5a35";
  const index = "0x0";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("handles Error objects correctly", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(new Error("Boom"));
    const result = await getTransactionByBlockHashAndIndex.handler({ blockHash, index });
    expect(result.content?.[0]?.text).toContain("Boom");
  });

  it("handles string errors correctly", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockImplementationOnce(() => Promise.reject("weird failure"));
    const result = await getTransactionByBlockHashAndIndex.handler({ blockHash, index });
    expect(result.content?.[0]?.text).toContain("weird failure");
  });

  it("handles unknown object errors correctly", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce({ code: 500, info: "internal" });
    const result = await getTransactionByBlockHashAndIndex.handler({ blockHash, index });
    expect(result.content?.[0]?.text).toContain('{"code":500,"info":"internal"}');
  });
});
