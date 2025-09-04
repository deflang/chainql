import { getBlockByHash } from "../../tools/getBlockByHash";
import { INFURA_CHAIN_URLS } from "../../config/chains";

global.fetch = jest.fn();

describe("getBlockByHash", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("fetches block successfully", async () => {
    const mockBlock = {
      number: "0x5bad55",
      hash: "0xb3b20624f8f0f86eb50dd04688409e5cea4bd02d700bf6e79e9384d47d6a5a35",
      gasUsed: "0x79ccd3",
      miner: "0x5a0b54d5dc17e0aadc383d2db43b0a0d3e029c4c",
      transactions: ["0x123", "0x456"],
    };

    const mockResponse = {
      json: async () => ({ result: mockBlock }),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockResponse);

    const result = await getBlockByHash.handler({
      hash: mockBlock.hash,
      includeTxs: false,
    });

    expect(result.content?.[0]?.text).toContain("Block info (chainid 1):");
    expect(result.content?.[0]?.text).toContain(mockBlock.hash);
    expect(result.content?.[0]?.text).toContain(mockBlock.number);
    expect(fetch).toHaveBeenCalledWith(
      INFURA_CHAIN_URLS[1],
      expect.objectContaining({
        body: expect.stringContaining('"eth_getBlockByHash"'),
      })
    );
  });

  it("handles unsupported chain ID", async () => {
    const result = await getBlockByHash.handler({
      hash: "0xabc123",
      chainid: 9999,
    });

    expect(result.content?.[0]?.text).toContain("Unsupported chain ID: 9999");
  });

  it("handles RPC error response", async () => {
    const mockResponse = {
      json: async () => ({ error: { message: "Block not found" } }),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockResponse);

    const result = await getBlockByHash.handler({
      hash: "0xdoesnotexist",
    });

    expect(result.content?.[0]?.text).toContain("Error fetching block: Block not found");
  });

  it("handles missing result in RPC response", async () => {
    const mockResponse = {
      json: async () => ({}), // no result, no error
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockResponse);

    const result = await getBlockByHash.handler({
      hash: "0xdeadbeef",
    });

    expect(result.content?.[0]?.text).toContain("Error fetching block: Unknown error");
  });

  it("handles network errors", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(new Error("Network down"));

    const result = await getBlockByHash.handler({
      hash: "0x123",
    });

    expect(result.content?.[0]?.text).toContain("Error fetching block: Network down");
  });

  it("passes includeTxs param properly", async () => {
    const mockBlock = { number: "0x1", hash: "0xabc", transactions: [] };
    const mockResponse = { json: async () => ({ result: mockBlock }) } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockResponse);

    await getBlockByHash.handler({
      hash: mockBlock.hash,
      includeTxs: true,
    });

    expect(fetch).toHaveBeenCalledWith(
      INFURA_CHAIN_URLS[1],
      expect.objectContaining({
        body: expect.stringContaining("[\"" + mockBlock.hash + "\",true]"),
      })
    );
  });
});

describe("getBlockByHash error handling variations", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("handles Error objects correctly", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(new Error("Boom"));

    const result = await getBlockByHash.handler({ hash: "0x123" });

    expect(result.content?.[0]?.text).toContain("Boom");
  });

  it("handles string errors correctly", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce("weird failure");

    const result = await getBlockByHash.handler({ hash: "0x123" });

    expect(result.content?.[0]?.text).toContain("weird failure");
  });

  it("handles unknown object errors correctly", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce({
      code: 500,
      info: "internal",
    });

    const result = await getBlockByHash.handler({ hash: "0x123" });

    expect(result.content?.[0]?.text).toContain('{"code":500,"info":"internal"}');
  });
});
