import { getTransactionCount } from "../../../tools/ethereum/getTransactionCount";
import { INFURA_CHAIN_URLS } from "../../../config/chains";

global.fetch = jest.fn();

describe("getTransactionCount", () => {
  const mockAddress = "0x0000000000000000000000000000000000000000";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("fetches transaction count successfully", async () => {
    const mockResponse = {
      json: async () => ({ result: "0x1a" }), // 26 transactions
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getTransactionCount.handler({ address: mockAddress });

    expect(result.content[0]?.text).toContain("26");
    expect(fetch).toHaveBeenCalledWith(
      INFURA_CHAIN_URLS[1],
      expect.any(Object)
    );
  });

  it("handles unsupported chain ID", async () => {
    const result = await getTransactionCount.handler({
      address: mockAddress,
      chainid: 9999,
    });

    expect(result.content[0]?.text).toContain("Unsupported chain ID");
  });

  it("handles RPC error response", async () => {
    const mockResponse = {
      json: async () => ({ error: { message: "RPC failed" } }),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getTransactionCount.handler({ address: mockAddress });

    expect(result.content[0]?.text).toContain(
      "Error fetching transaction count: RPC failed"
    );
  });

  it("handles unknown RPC error when result is missing", async () => {
    const mockResponse = {
      json: async () => ({}), // No result, no error
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getTransactionCount.handler({ address: mockAddress });

    expect(result.content[0]?.text).toContain(
      "Error fetching transaction count: Unknown error"
    );
  });

  it("handles network errors", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      new Error("Network failure")
    );

    const result = await getTransactionCount.handler({ address: mockAddress });

    expect(result.content[0]?.text).toContain(
      "Error fetching transaction count"
    );
  });

  it("defaults to latest block if not provided", async () => {
    const mockResponse = {
      json: async () => ({ result: "0x2" }),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    await getTransactionCount.handler({ address: mockAddress });

    expect(fetch).toHaveBeenCalledWith(
      INFURA_CHAIN_URLS[1],
      expect.objectContaining({
        body: expect.stringContaining('"latest"'),
      })
    );
  });
});
