import { getTransactionByBlockNumberAndIndex } from "../../tools/getTransactionByBlockNumberAndIndex";

global.fetch = jest.fn();

describe("getTransactionByBlockNumberAndIndex", () => {
  const blockNumberOrTag = "0x5BAD55";
  const index = "0x0";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("fetches transaction successfully", async () => {
    const mockTx = {
      hash: "0x140fc3229057d6a484227cbcae16331f586310f68f2095dbc75b3af53d4874bd",
      blockNumber: "0x11dca94",
      transactionIndex: index,
    };

    const mockResponse = { json: async () => ({ result: mockTx }) } as Response;
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockResponse);

    const result = await getTransactionByBlockNumberAndIndex.handler({ blockNumberOrTag, index });

    expect(result.content?.[0]?.text).toContain("Transaction for block");
    expect(result.content?.[1]?.text).toContain(mockTx.hash);
  });

  it("returns message when transaction not found", async () => {
    const mockResponse = { json: async () => ({ result: null }) } as Response;
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockResponse);

    const result = await getTransactionByBlockNumberAndIndex.handler({ blockNumberOrTag, index });
    expect(result.content?.[0]?.text).toContain("No transaction found");
  });

  it("handles unsupported chain ID", async () => {
    const result = await getTransactionByBlockNumberAndIndex.handler({
      blockNumberOrTag,
      index,
      chainid: 9999,
    });
    expect(result.content?.[0]?.text).toContain("Unsupported chain ID: 9999");
  });

  it("handles RPC error response", async () => {
    const mockResponse = { json: async () => ({ error: { message: "transaction not found" } }) } as Response;
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockResponse);

    const result = await getTransactionByBlockNumberAndIndex.handler({ blockNumberOrTag, index });
    expect(result.content?.[0]?.text).toContain("Error fetching transaction: transaction not found");
  });

  it("handles unknown RPC response (no result, no error)", async () => {
    const mockResponse = { json: async () => ({}) } as Response;
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockResponse);

    const result = await getTransactionByBlockNumberAndIndex.handler({ blockNumberOrTag, index });
    expect(result.content?.[0]?.text).toContain("Error fetching transaction: Unknown error");
  });

  it("handles network errors", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(new Error("Network down"));
    const result = await getTransactionByBlockNumberAndIndex.handler({ blockNumberOrTag, index });
    expect(result.content?.[0]?.text).toContain("Error fetching transaction: Network down");
  });
});

describe("getTransactionByBlockNumberAndIndex error handling variations", () => {
  const blockNumberOrTag = "0x5BAD55";
  const index = "0x0";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("handles Error objects correctly", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(new Error("Boom"));
    const result = await getTransactionByBlockNumberAndIndex.handler({ blockNumberOrTag, index });
    expect(result.content?.[0]?.text).toContain("Boom");
  });

  it("handles string errors correctly", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockImplementationOnce(() => Promise.reject("weird failure"));
    const result = await getTransactionByBlockNumberAndIndex.handler({ blockNumberOrTag, index });
    expect(result.content?.[0]?.text).toContain("weird failure");
  });

  it("handles unknown object errors correctly", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce({ code: 500, info: "internal" });
    const result = await getTransactionByBlockNumberAndIndex.handler({ blockNumberOrTag, index });
    expect(result.content?.[0]?.text).toContain('{"code":500,"info":"internal"}');
  });
});
