import { getBlockTransactionCountByHash } from "../../tools/getBlockTransactionCountByHash";
import { INFURA_CHAIN_URLS } from "../../config/chains";

global.fetch = jest.fn();

describe("getBlockTransactionCountByHash", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("fetches transaction count successfully", async () => {
    const hash = "0xb3b20624f8f0f86eb50dd04688409e5cea4bd02d700bf6e79e9384d47d6a5a35";
    const mockResponse = {
      json: async () => ({ result: "0x50" }),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getBlockTransactionCountByHash.handler({ hash });

    expect(result.content?.[0]?.text).toContain("Transaction count for block");
    expect(result.content?.[0]?.text).toContain("0x50");
    expect(result.content?.[0]?.text).toContain(String(parseInt("0x50", 16)));
    expect(fetch).toHaveBeenCalledWith(
      INFURA_CHAIN_URLS[1],
      expect.objectContaining({
        body: expect.stringContaining("\"eth_getBlockTransactionCountByHash\""),
      })
    );
  });

  it("handles unsupported chain ID", async () => {
    const result = await getBlockTransactionCountByHash.handler({
      hash: "0xabc",
      chainid: 9999,
    });

    expect(result.content?.[0]?.text).toContain("Unsupported chain ID: 9999");
  });

  it("handles RPC error response", async () => {
    const mockResponse = {
      json: async () => ({ error: { message: "Block not found" } }),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getBlockTransactionCountByHash.handler({
      hash: "0xdoesnotexist",
    });

    expect(result.content?.[0]?.text).toContain(
      "Error fetching block transaction count: Block not found"
    );
  });

  it("handles unknown RPC response (no result, no error)", async () => {
    const mockResponse = {
      json: async () => ({}),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getBlockTransactionCountByHash.handler({
      hash: "0xdeadbeef",
    });

    expect(result.content?.[0]?.text).toContain(
      "Error fetching block transaction count: Unknown error"
    );
  });

  it("handles network errors", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      new Error("Network down")
    );

    const result = await getBlockTransactionCountByHash.handler({
      hash: "0x123",
    });

    expect(result.content?.[0]?.text).toContain(
      "Error fetching block transaction count: Network down"
    );
  });
});


