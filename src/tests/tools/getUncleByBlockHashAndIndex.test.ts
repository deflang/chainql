import { getUncleByBlockHashAndIndex } from "../../tools/ethereum/getUncleByBlockHashAndIndex";
import { INFURA_CHAIN_URLS } from "../../config/chains";

global.fetch = jest.fn();

describe("getUncleByBlockHashAndIndex", () => {
  const blockHash =
    "0xb3b20624f8f0f86eb50dd04688409e5cea4bd02d700bf6e79e9384d47d6a5a35";
  const index = "0x0";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("fetches uncle successfully", async () => {
    const mockUncle = { number: "0x299", hash: "0x932bdf...", parentHash: "0xa779..." };
    const mockResponse = { json: async () => ({ result: mockUncle }) } as Response;
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockResponse);

    const result = await getUncleByBlockHashAndIndex.handler({ blockHash, index });

    expect(result.content?.[0]?.text).toContain("Uncle for block");
    expect(result.content?.[1]?.text).toContain("number");
    expect(fetch).toHaveBeenCalledWith(
      INFURA_CHAIN_URLS[1],
      expect.objectContaining({ body: expect.stringContaining("\"eth_getUncleByBlockHashAndIndex\"") })
    );
  });

  it("returns message when uncle not found", async () => {
    const mockResponse = { json: async () => ({ result: null }) } as Response;
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockResponse);

    const result = await getUncleByBlockHashAndIndex.handler({ blockHash, index: "0x1" });

    expect(result.content?.[0]?.text).toContain("No uncle found");
  });

  it("handles unsupported chain ID", async () => {
    const result = await getUncleByBlockHashAndIndex.handler({ blockHash, index, chainid: 9999 });
    expect(result.content?.[0]?.text).toContain("Unsupported chain ID: 9999");
  });

  it("handles RPC error response", async () => {
    const mockResponse = { json: async () => ({ error: { message: "uncle not found" } }) } as Response;
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockResponse);

    const result = await getUncleByBlockHashAndIndex.handler({ blockHash, index });
    expect(result.content?.[0]?.text).toContain("Error fetching uncle: uncle not found");
  });

  it("handles unknown RPC response (no result, no error)", async () => {
    const mockResponse = { json: async () => ({}) } as Response;
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockResponse);

    const result = await getUncleByBlockHashAndIndex.handler({ blockHash, index });
    expect(result.content?.[0]?.text).toContain("Error fetching uncle: Unknown error");
  });

  it("handles network errors", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(new Error("Network down"));

    const result = await getUncleByBlockHashAndIndex.handler({ blockHash, index });
    expect(result.content?.[0]?.text).toContain("Error fetching uncle: Network down");
  });
});

describe("getUncleByBlockHashAndIndex error handling variations", () => {
  const blockHash =
    "0xb3b20624f8f0f86eb50dd04688409e5cea4bd02d700bf6e79e9384d47d6a5a35";
  const index = "0x0";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("handles Error objects correctly", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(new Error("Boom"));

    const result = await getUncleByBlockHashAndIndex.handler({ blockHash, index });
    expect(result.content?.[0]?.text).toContain("Boom");
  });

  it("handles string errors correctly", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockImplementationOnce(() => Promise.reject("weird failure"));

    const result = await getUncleByBlockHashAndIndex.handler({ blockHash, index });
    expect(result.content?.[0]?.text).toContain("weird failure");
  });

  it("handles unknown object errors correctly", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce({ code: 500, info: "internal" });

    const result = await getUncleByBlockHashAndIndex.handler({ blockHash, index });
    expect(result.content?.[0]?.text).toContain('{"code":500,"info":"internal"}');
  });
});
