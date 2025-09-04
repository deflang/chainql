import { getUncleCountByBlockNumber } from "../../tools/getUncleCountByBlockNumber";
import { INFURA_CHAIN_URLS } from "../../config/chains";

global.fetch = jest.fn();

describe("getUncleCountByBlockNumber", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("fetches uncle count successfully", async () => {
    const blockNumberOrTag = "0x5bad55";

    const mockResponse = {
      json: async () => ({ result: "0x1" }),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getUncleCountByBlockNumber.handler({
      blockNumberOrTag,
    });

    expect(result.content?.[0]?.text).toContain("Uncle count for block");
    expect(result.content?.[0]?.text).toContain("0x1");
    expect(fetch).toHaveBeenCalledWith(
      INFURA_CHAIN_URLS[1],
      expect.objectContaining({
        body: expect.stringContaining("\"eth_getUncleCountByBlockNumber\""),
      })
    );
  });

  it("handles unsupported chain ID", async () => {
    const result = await getUncleCountByBlockNumber.handler({
      blockNumberOrTag: "0x5bad55",
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

    const result = await getUncleCountByBlockNumber.handler({
      blockNumberOrTag: "0x5bad55",
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

    const result = await getUncleCountByBlockNumber.handler({
      blockNumberOrTag: "0x5bad55",
    });

    expect(result.content?.[0]?.text).toContain(
      "Error fetching uncle count: Unknown error"
    );
  });

  it("handles network errors", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      new Error("Network down")
    );

    const result = await getUncleCountByBlockNumber.handler({
      blockNumberOrTag: "0x5bad55",
    });

    expect(result.content?.[0]?.text).toContain(
      "Error fetching uncle count: Network down"
    );
  });
});


