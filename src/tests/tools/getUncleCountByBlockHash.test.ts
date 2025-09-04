import { getUncleCountByBlockHash } from "../../tools/getUncleCountByBlockHash";
import { INFURA_CHAIN_URLS } from "../../config/chains";

global.fetch = jest.fn();

describe("getUncleCountByBlockHash", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("fetches uncle count successfully", async () => {
    const blockHash =
      "0xb3b20624f8f0f86eb50dd04688409e5cea4bd02d700bf6e79e9384d47d6a5a35";

    const mockResponse = {
      json: async () => ({ result: "0x1" }),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getUncleCountByBlockHash.handler({ blockHash });

    expect(result.content?.[0]?.text).toContain("Uncle count for block");
    expect(result.content?.[0]?.text).toContain("0x1");
    expect(fetch).toHaveBeenCalledWith(
      INFURA_CHAIN_URLS[1],
      expect.objectContaining({
        body: expect.stringContaining("\"eth_getUncleCountByBlockHash\""),
      })
    );
  });

  it("handles unsupported chain ID", async () => {
    const result = await getUncleCountByBlockHash.handler({
      blockHash:
        "0xb3b20624f8f0f86eb50dd04688409e5cea4bd02d700bf6e79e9384d47d6a5a35",
      chainid: 9999,
    });

    expect(result.content?.[0]?.text).toContain("Unsupported chain ID: 9999");
  });

  it("handles RPC error response", async () => {
    const mockResponse = {
      json: async () => ({ error: { message: "block not found" } }),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getUncleCountByBlockHash.handler({
      blockHash:
        "0xb3b20624f8f0f86eb50dd04688409e5cea4bd02d700bf6e79e9384d47d6a5a35",
    });

    expect(result.content?.[0]?.text).toContain(
      "Error fetching uncle count: block not found"
    );
  });

  it("handles unknown RPC response (no result, no error)", async () => {
    const mockResponse = {
      json: async () => ({}),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getUncleCountByBlockHash.handler({
      blockHash:
        "0xb3b20624f8f0f86eb50dd04688409e5cea4bd02d700bf6e79e9384d47d6a5a35",
    });

    expect(result.content?.[0]?.text).toContain(
      "Error fetching uncle count: Unknown error"
    );
  });

  it("handles network errors", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      new Error("Network down")
    );

    const result = await getUncleCountByBlockHash.handler({
      blockHash:
        "0xb3b20624f8f0f86eb50dd04688409e5cea4bd02d700bf6e79e9384d47d6a5a35",
    });

    expect(result.content?.[0]?.text).toContain(
      "Error fetching uncle count: Network down"
    );
  });
});


