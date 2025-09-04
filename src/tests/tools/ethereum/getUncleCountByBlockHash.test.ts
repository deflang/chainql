import { getUncleCountByBlockHash } from "../../../tools/ethereum/getUncleCountByBlockHash";
import { INFURA_CHAIN_URLS } from "../../../config/chains";

global.fetch = jest.fn();

describe("getUncleCountByBlockHash", () => {
  const blockHash =
    "0xb3b20624f8f0f86eb50dd04688409e5cea4bd02d700bf6e79e9384d47d6a5a35";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("fetches uncle count successfully with default chainid", async () => {
    const mockResponse = { json: async () => ({ result: "0x2" }) } as Response;
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockResponse);

    const result = await getUncleCountByBlockHash.handler({ blockHash });

    expect(result.content?.[0]?.text).toContain(
      `Uncle count for block ${blockHash} on chainid 1: 2 (hex: 0x2)`
    );
    expect(fetch).toHaveBeenCalledWith(
      INFURA_CHAIN_URLS[1],
      expect.objectContaining({
        body: expect.stringContaining('"eth_getUncleCountByBlockHash"'),
      })
    );
  });

  it("fetches uncle count successfully with a specific supported chainid", async () => {
    const mockResponse = { json: async () => ({ result: "0x3" }) } as Response;
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockResponse);

    const result = await getUncleCountByBlockHash.handler({ blockHash, chainid: 1 });

    expect(result.content?.[0]?.text).toContain("3");
    expect(result.content?.[0]?.text).toContain("hex: 0x3");
  });

  it("handles unsupported chain ID", async () => {
    const result = await getUncleCountByBlockHash.handler({ blockHash, chainid: 9999 });

    expect(result.content?.[0]?.text).toContain("Unsupported chain ID: 9999");
  });

  it("handles RPC error response", async () => {
    const mockResponse = { json: async () => ({ error: { message: "block not found" } }) } as Response;
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockResponse);

    const result = await getUncleCountByBlockHash.handler({ blockHash });

    expect(result.content?.[0]?.text).toContain(
      "Error fetching uncle count: block not found"
    );
  });

  it("handles unknown RPC response (no result, no error)", async () => {
    const mockResponse = { json: async () => ({}) } as Response;
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockResponse);

    const result = await getUncleCountByBlockHash.handler({ blockHash });

    expect(result.content?.[0]?.text).toContain(
      "Error fetching uncle count: Unknown error"
    );
  });

  it("handles network errors", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(new Error("Network down"));

    const result = await getUncleCountByBlockHash.handler({ blockHash });

    expect(result.content?.[0]?.text).toContain(
      "Error fetching uncle count: Network down"
    );
  });
});

describe("getUncleCountByBlockHash error handling variations", () => {
  const blockHash =
    "0xb3b20624f8f0f86eb50dd04688409e5cea4bd02d700bf6e79e9384d47d6a5a35";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("handles Error objects correctly", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(new Error("Boom"));

    const result = await getUncleCountByBlockHash.handler({ blockHash });

    expect(result.content?.[0]?.text).toContain("Boom");
  });

  it("handles string errors correctly", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockImplementationOnce(() =>
      Promise.reject("weird failure")
    );

    const result = await getUncleCountByBlockHash.handler({ blockHash });

    expect(result.content?.[0]?.text).toContain("weird failure");
  });

  it("handles unknown object errors correctly", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce({
      code: 500,
      info: "internal",
    });

    const result = await getUncleCountByBlockHash.handler({ blockHash });

    expect(result.content?.[0]?.text).toContain('{"code":500,"info":"internal"}');
  });
});
