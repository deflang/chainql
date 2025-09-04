import { getEthBalance } from "../../../tools/ethereum/getBalance";
import { INFURA_CHAIN_URLS } from "../../../config/chains";

global.fetch = jest.fn();

describe("getEthBalance", () => {
  const mockAddress = "0x0000000000000000000000000000000000000000";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("fetches balance successfully", async () => {
    // Typed mock response
    const mockResponse = {
      json: async () => ({ result: "0xde0b6b3a7640000" }),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getEthBalance.handler({ address: mockAddress });

    expect(result.content?.[0]?.text).toContain("1 ETH");
    expect(fetch).toHaveBeenCalledWith(
      INFURA_CHAIN_URLS[1],
      expect.any(Object)
    );
  });

  it("handles unsupported chain ID", async () => {
    const result = await getEthBalance.handler({
      address: mockAddress,
      chainid: 9999,
    });
    expect(result.content?.[0]?.text).toContain("Unsupported chain ID");
  });

  it("handles RPC error response", async () => {
    const mockResponse = {
      json: async () => ({ error: { message: "Some RPC error" } }),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getEthBalance.handler({ address: mockAddress });

    expect(result.content?.[0]?.text).toContain(
      "Error fetching balance: Some RPC error"
    );
  });

  it("handles unknown RPC error when result is missing", async () => {
    const mockResponse = {
      json: async () => ({}), // No result, no error
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getEthBalance.handler({ address: mockAddress });

    expect(result.content?.[0]?.text).toContain(
      "Error fetching balance: Unknown error"
    );
  });

  it("handles network errors", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      new Error("Network failure")
    );

    const result = await getEthBalance.handler({ address: mockAddress });

    expect(result.content?.[0]?.text).toContain("Error fetching balance");
  });

  it("defaults to latest block if not provided", async () => {
    const mockResponse = {
      json: async () => ({ result: "0xde0b6b3a7640000" }),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    await getEthBalance.handler({ address: mockAddress });

    expect(fetch).toHaveBeenCalledWith(
      INFURA_CHAIN_URLS[1],
      expect.objectContaining({
        body: expect.stringContaining('"latest"'),
      })
    );
  });
});
