import { getProtocolVersion } from "../../tools/ethereum/getProtocolVersion";
import { INFURA_CHAIN_URLS } from "../../config/chains";

global.fetch = jest.fn();

describe("eth_protocolVersion", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("fetches protocol version successfully", async () => {
    const mockResponse = { json: async () => ({ result: "0x41" }) } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockResponse);

    const result = await getProtocolVersion.handler({});

    expect(result.content?.[0]?.text).toContain("Protocol version on chainid 1");
    expect(result.content?.[0]?.text).toContain("0x41");
    expect(fetch).toHaveBeenCalledWith(
      INFURA_CHAIN_URLS[1],
      expect.objectContaining({ body: expect.stringContaining('"eth_protocolVersion"') })
    );
  });

  it("handles unsupported chain ID", async () => {
    const result = await getProtocolVersion.handler({ chainid: 9999 });
    expect(result.content?.[0]?.text).toContain("Unsupported chain ID: 9999");
  });

  it("handles RPC error response", async () => {
    const mockResponse = { json: async () => ({ error: { message: "RPC failed" } }) } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockResponse);

    const result = await getProtocolVersion.handler({});
    expect(result.content?.[0]?.text).toContain(
      "Error fetching protocol version: RPC failed"
    );
  });

  it("handles unknown RPC response (no result, no error)", async () => {
    const mockResponse = { json: async () => ({}) } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockResponse);

    const result = await getProtocolVersion.handler({});
    expect(result.content?.[0]?.text).toContain(
      "Error fetching protocol version: Unknown error"
    );
  });

  it("handles network errors", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      new Error("Network down")
    );

    const result = await getProtocolVersion.handler({});
    expect(result.content?.[0]?.text).toContain(
      "Error fetching protocol version: Network down"
    );
  });

  it("handles non-Error thrown object (string)", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      "Unexpected failure"
    );

    const result = await getProtocolVersion.handler({});
    expect(result.content?.[0]?.text).toContain(
      "Error fetching protocol version: Unexpected failure"
    );
  });

  it("handles non-Error thrown object (plain object)", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce({
      foo: "bar",
    });

    const result = await getProtocolVersion.handler({});
    expect(result.content?.[0]?.text).toContain(
      'Error fetching protocol version: {"foo":"bar"}'
    );
  });
});
