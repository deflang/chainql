import { getMiningStatus } from "../../tools/ethereum/getMiningStatus";
import { INFURA_CHAIN_URLS } from "../../config/chains";

global.fetch = jest.fn();

describe("eth_mining", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("fetches mining status successfully", async () => {
    const mockResponse = { json: async () => ({ result: false }) } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockResponse);

    const result = await getMiningStatus.handler({});

    expect(result.content?.[0]?.text).toContain("Mining status on chainid 1");
    expect(result.content?.[0]?.text).toContain("false");
    expect(fetch).toHaveBeenCalledWith(
      INFURA_CHAIN_URLS[1],
      expect.objectContaining({ body: expect.stringContaining('"eth_mining"') })
    );
  });

  it("handles unsupported chain ID", async () => {
    const result = await getMiningStatus.handler({ chainid: 9999 });
    expect(result.content?.[0]?.text).toContain("Unsupported chain ID: 9999");
  });

  it("handles RPC error response", async () => {
    const mockResponse = { json: async () => ({ error: { message: "RPC failed" } }) } as Response;
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockResponse);

    const result = await getMiningStatus.handler({});
    expect(result.content?.[0]?.text).toContain(
      "Error fetching mining status: RPC failed"
    );
  });

  it("handles unknown RPC response (no result, no error)", async () => {
    const mockResponse = { json: async () => ({}) } as Response;
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockResponse);

    const result = await getMiningStatus.handler({});
    expect(result.content?.[0]?.text).toContain(
      "Error fetching mining status: Unknown error"
    );
  });

  it("handles network errors", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(new Error("Network down"));

    const result = await getMiningStatus.handler({});
    expect(result.content?.[0]?.text).toContain(
      "Error fetching mining status: Network down"
    );
  });

  it("handles non-Error thrown object", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce("Unexpected failure");

    const result = await getMiningStatus.handler({});
    expect(result.content?.[0]?.text).toContain(
      "Error fetching mining status: Unexpected failure"
    );
  });

  it("handles unknown object errors correctly", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce({
      code: 123,
      info: "bad",
    });

    const result = await getMiningStatus.handler({});

    expect(result.content?.[0]?.text).toContain('{"code":123,"info":"bad"}');
  });
});
