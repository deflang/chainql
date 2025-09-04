import { getStorageAt } from "../../tools/getStorageAt";
import { INFURA_CHAIN_URLS } from "../../config/chains";

global.fetch = jest.fn();

describe("getStorageAt", () => {
  const address = "0x295a70b2de5e3953354a6a8344e616ed314d7251";
  const position = "0x0";
  const block = "0x65a8db";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("fetches storage value successfully", async () => {
    const mockResponse = {
      json: async () => ({
        result: "0x00000000000000000000000000000000000000000000000000000000000004d2",
      }),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockResponse);

    const result = await getStorageAt.handler({ address, position, block });

    expect(result.content?.[0]?.text).toContain(`Storage at ${position} for ${address}`);
    expect(result.content?.[0]?.text).toContain(block);
    expect(fetch).toHaveBeenCalledWith(
      INFURA_CHAIN_URLS[1],
      expect.objectContaining({
        body: expect.stringContaining('"eth_getStorageAt"'),
      })
    );
  });

  it("handles unsupported chain ID", async () => {
    const result = await getStorageAt.handler({
      address,
      position,
      block,
      chainid: 9999,
    });

    expect(result.content?.[0]?.text).toContain("Unsupported chain ID: 9999");
  });

  it("handles RPC error response", async () => {
    const mockResponse = {
      json: async () => ({ error: { message: "execution reverted" } }),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockResponse);

    const result = await getStorageAt.handler({
      address,
      position: "0x6661e9d6d8b923d5bbaab1b96e1dd51ff6ea2a93520fdc9eb75d059238b8c5e9",
      block: "latest",
    });

    expect(result.content?.[0]?.text).toContain(
      "Error fetching storage: execution reverted"
    );
  });

  it("handles unknown RPC response (no result, no error)", async () => {
    const mockResponse = { json: async () => ({}) } as Response;
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockResponse);

    const result = await getStorageAt.handler({ address, position, block: "latest" });
    expect(result.content?.[0]?.text).toContain("Error fetching storage: Unknown error");
  });

  it("handles network errors (Error object)", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(new Error("Network down"));
    const result = await getStorageAt.handler({ address, position, block: "latest" });
    expect(result.content?.[0]?.text).toContain("Error fetching storage: Network down");
  });

  it("handles network errors (string error)", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockImplementationOnce(() => Promise.reject("weird failure"));
    const result = await getStorageAt.handler({ address, position, block: "latest" });
    expect(result.content?.[0]?.text).toContain("weird failure");
  });

  it("handles network errors (unknown object)", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce({ code: 500, info: "internal" });
    const result = await getStorageAt.handler({ address, position, block: "latest" });
    expect(result.content?.[0]?.text).toContain('{"code":500,"info":"internal"}');
  });
});
