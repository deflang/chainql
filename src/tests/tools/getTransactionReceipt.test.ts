import { getTransactionReceipt } from "../../tools/getTransactionReceipt";

global.fetch = jest.fn();

describe("getTransactionReceipt", () => {
  const hash =
    "0xbb3a336e3f823ec18197f1e13ee875700f08f03e2cab75f0d0b118dabb44cba0";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("fetches receipt successfully", async () => {
    const mockReceipt = {
      transactionHash: hash,
      blockNumber: "0x11e5883",
      status: "0x1",
      logs: [],
    };

    const mockResponse = { json: async () => ({ result: mockReceipt }) } as Response;
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockResponse);

    const result = await getTransactionReceipt.handler({ hash });

    expect(result.content?.[0]?.text).toContain("Transaction receipt for hash");
    expect(result.content?.[1]?.text).toContain(hash);
  });

  it("returns message when receipt not found", async () => {
    const mockResponse = { json: async () => ({ result: null }) } as Response;
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockResponse);

    const result = await getTransactionReceipt.handler({ hash });
    expect(result.content?.[0]?.text).toContain("No transaction receipt found");
  });

  it("handles unsupported chain ID", async () => {
    const result = await getTransactionReceipt.handler({ hash, chainid: 9999 });
    expect(result.content?.[0]?.text).toContain("Unsupported chain ID: 9999");
  });

  it("handles RPC error response", async () => {
    const mockResponse = { json: async () => ({ error: { message: "receipt not found" } }) } as Response;
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockResponse);

    const result = await getTransactionReceipt.handler({ hash });
    expect(result.content?.[0]?.text).toContain("Error fetching transaction receipt: receipt not found");
  });

  it("handles unknown RPC response (no result, no error)", async () => {
    const mockResponse = { json: async () => ({}) } as Response;
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockResponse);

    const result = await getTransactionReceipt.handler({ hash });
    expect(result.content?.[0]?.text).toContain("Error fetching transaction receipt: Unknown error");
  });

  it("handles network errors", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(new Error("Network down"));
    const result = await getTransactionReceipt.handler({ hash });
    expect(result.content?.[0]?.text).toContain("Error fetching transaction receipt: Network down");
  });
});

describe("getTransactionReceipt error handling variations", () => {
  const hash =
    "0xbb3a336e3f823ec18197f1e13ee875700f08f03e2cab75f0d0b118dabb44cba0";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("handles Error objects correctly", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(new Error("Boom"));
    const result = await getTransactionReceipt.handler({ hash });
    expect(result.content?.[0]?.text).toContain("Boom");
  });

  it("handles string errors correctly", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockImplementationOnce(() => Promise.reject("weird failure"));
    const result = await getTransactionReceipt.handler({ hash });
    expect(result.content?.[0]?.text).toContain("weird failure");
  });

  it("handles unknown object errors correctly", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce({ code: 500, info: "internal" });
    const result = await getTransactionReceipt.handler({ hash });
    expect(result.content?.[0]?.text).toContain('{"code":500,"info":"internal"}');
  });
});
