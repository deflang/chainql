import { getHashrate } from "../../tools/getHashRate";
import { INFURA_CHAIN_URLS } from "../../config/chains";

global.fetch = jest.fn();

describe("eth_hashrate", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("fetches hashrate successfully", async () => {
    const mockResponse = {
      json: async () => ({ result: "0x0" }),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockResponse);

    const result = await getHashrate.handler({});

    expect(result.content?.[0]?.text).toContain("Node hashrate on chainid 1");
    expect(result.content?.[0]?.text).toContain("0x0");
    expect(fetch).toHaveBeenCalledWith(
      INFURA_CHAIN_URLS[1],
      expect.objectContaining({
        body: expect.stringContaining('"eth_hashrate"'),
      })
    );
  });

  it("handles unsupported chain ID", async () => {
    const result = await getHashrate.handler({ chainid: 9999 });
    expect(result.content?.[0]?.text).toContain("Unsupported chain ID: 9999");
  });

  it("handles RPC error response", async () => {
    const mockResponse = {
      json: async () => ({ error: { message: "RPC failed" } }),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockResponse);

    const result = await getHashrate.handler({});
    expect(result.content?.[0]?.text).toContain("Error fetching hashrate: RPC failed");
  });

  it("handles unknown RPC response (no result, no error)", async () => {
    const mockResponse = {
      json: async () => ({}),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockResponse);

    const result = await getHashrate.handler({});
    expect(result.content?.[0]?.text).toContain("Error fetching hashrate: Unknown error");
  });

  it("handles network errors", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      new Error("Network down")
    );

    const result = await getHashrate.handler({});
    expect(result.content?.[0]?.text).toContain("Error fetching hashrate: Network down");
  });

  it("handles non-Error thrown object", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce("Something went wrong");

    const result = await getHashrate.handler({});
    expect(result.content?.[0]?.text).toContain(
      'Error fetching hashrate: Something went wrong'
    );
  });
});
