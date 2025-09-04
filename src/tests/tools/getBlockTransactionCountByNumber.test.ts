import { getBlockTransactionCountByNumber } from "../../tools/getBlockTransactionCountByNumber";
import { INFURA_CHAIN_URLS } from "../../config/chains";

global.fetch = jest.fn();

describe("getBlockTransactionCountByNumber", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("fetches transaction count successfully for latest", async () => {
    const mockResponse = {
      json: async () => ({ result: "0xa0" }),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getBlockTransactionCountByNumber.handler({
      blockNumberOrTag: "latest",
    });

    expect(result.content?.[0]?.text).toContain(
      "Transaction count for block latest"
    );
    expect(result.content?.[0]?.text).toContain("0xa0");
    expect(result.content?.[0]?.text).toContain(String(parseInt("0xa0", 16)));
    expect(fetch).toHaveBeenCalledWith(
      INFURA_CHAIN_URLS[1],
      expect.objectContaining({
        body: expect.stringContaining(
          "\"eth_getBlockTransactionCountByNumber\""
        ),
      })
    );
  });

  it("handles unsupported chain ID", async () => {
    const result = await getBlockTransactionCountByNumber.handler({
      blockNumberOrTag: "0x10",
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

    const result = await getBlockTransactionCountByNumber.handler({
      blockNumberOrTag: "0xdoesnotexist",
    });

    expect(result.content?.[0]?.text).toContain(
      "Error fetching block transaction count by number: Block not found"
    );
  });

  it("handles unknown RPC response (no result, no error)", async () => {
    const mockResponse = {
      json: async () => ({}),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getBlockTransactionCountByNumber.handler({
      blockNumberOrTag: "0xdeadbeef",
    });

    expect(result.content?.[0]?.text).toContain(
      "Error fetching block transaction count by number: Unknown error"
    );
  });

  it("handles network errors", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      new Error("Network down")
    );

    const result = await getBlockTransactionCountByNumber.handler({
      blockNumberOrTag: "latest",
    });

    expect(result.content?.[0]?.text).toContain(
      "Error fetching block transaction count by number: Network down"
    );
  });
});


