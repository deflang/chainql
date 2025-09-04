import { getBlockReceipts } from "../../tools/ethereum/getBlockReceipts";
import { INFURA_CHAIN_URLS } from "../../config/chains";

global.fetch = jest.fn();

describe("getBlockReceipts", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("fetches receipts successfully", async () => {
    const mockReceipts = [
      {
        blockHash: "0xabc",
        blockNumber: "0x1",
        transactionHash: "0x123",
        gasUsed: "0x5208",
        logs: [],
      },
    ];

    const mockResponse = { json: async () => ({ result: mockReceipts }) } as Response;
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockResponse);

    const result = await getBlockReceipts.handler({
      blockNumber: "0x1",
    });

    expect(result.content?.[0]?.text).toContain("Block receipts (chainid 1):");
    expect(result.content?.[0]?.text).toContain(mockReceipts[0]?.blockHash);
    expect(fetch).toHaveBeenCalledWith(
      INFURA_CHAIN_URLS[1],
      expect.objectContaining({
        body: expect.stringContaining('"eth_getBlockReceipts"'),
      })
    );
  });

  it("handles unsupported chain ID", async () => {
    const result = await getBlockReceipts.handler({
      blockNumber: "0x1",
      chainid: 9999,
    });

    expect(result.content?.[0]?.text).toContain("Unsupported chain ID: 9999");
  });

  it("handles RPC error response", async () => {
    const mockResponse = { json: async () => ({ error: { message: "Block not found" } }) } as Response;
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockResponse);

    const result = await getBlockReceipts.handler({ blockNumber: "0xdead" });

    expect(result.content?.[0]?.text).toContain("Error fetching block receipts: Block not found");
  });

  it("handles missing result in RPC response", async () => {
    const mockResponse = { json: async () => ({}) } as Response;
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockResponse);

    const result = await getBlockReceipts.handler({ blockNumber: "0x123" });

    expect(result.content?.[0]?.text).toContain("Error fetching block receipts: Unknown error");
  });

  it("handles network errors", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(new Error("Network down"));

    const result = await getBlockReceipts.handler({ blockNumber: "0x123" });

    expect(result.content?.[0]?.text).toContain("Error fetching block receipts: Network down");
  });
});

describe("getBlockReceipts error handling variations", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("handles Error objects correctly", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(new Error("Boom"));

    const result = await getBlockReceipts.handler({ blockNumber: "0x123" });

    expect(result.content?.[0]?.text).toContain("Boom");
  });

  it("handles string errors correctly", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce("weird failure");

    const result = await getBlockReceipts.handler({ blockNumber: "0x123" });

    expect(result.content?.[0]?.text).toContain("weird failure");
  });

  it("handles unknown object errors correctly", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce({ code: 500, info: "internal" });

    const result = await getBlockReceipts.handler({ blockNumber: "0x123" });

    expect(result.content?.[0]?.text).toContain('{"code":500,"info":"internal"}');
  });
});
