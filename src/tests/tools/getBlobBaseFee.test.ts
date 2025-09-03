import { getBlobBaseFee } from "../../tools/getBlobBaseFee";
import { INFURA_CHAIN_URLS } from "../../config/chains";

global.fetch = jest.fn();

describe("getBlobBaseFee", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("fetches blob base fee successfully", async () => {
    const mockResponse = {
      json: async () => ({ result: "0x1" }), // hex value in wei
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getBlobBaseFee.handler({ chainid: 1 });

    expect(result.content?.[0]?.text).toContain("Blob base fee");
    expect(result.content?.[0]?.text).toContain("0x1");
    expect(fetch).toHaveBeenCalledWith(
      INFURA_CHAIN_URLS[1],
      expect.any(Object)
    );
  });

  it("handles unsupported chain ID", async () => {
    const result = await getBlobBaseFee.handler({ chainid: 9999 });

    expect(result.content?.[0]?.text).toContain(
      "Unsupported or missing URL for chain ID 9999"
    );
  });

  it("handles RPC error response", async () => {
    const mockResponse = {
      json: async () => ({ error: { message: "Some RPC error" } }),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getBlobBaseFee.handler({ chainid: 1 });

    expect(result.content?.[0]?.text).toContain(
      "Error fetching blob base fee: Some RPC error"
    );
  });

  it("handles unknown RPC error when result is missing", async () => {
    const mockResponse = {
      json: async () => ({}), // No result, no error
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getBlobBaseFee.handler({ chainid: 1 });

    expect(result.content?.[0]?.text).toContain(
      "Error fetching blob base fee: Unknown error"
    );
  });

  it("handles network errors", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      new Error("Network failure")
    );

    const result = await getBlobBaseFee.handler({ chainid: 1 });

    expect(result.content?.[0]?.text).toContain("Error fetching blob base fee");
    expect(result.content?.[0]?.text).toContain("Network failure");
  });

  it("handles non-Error exceptions gracefully", async () => {
    // Force fetch to reject with a string instead of an Error
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      "weird failure"
    );

    const result = await getBlobBaseFee.handler({ chainid: 1 });

    expect(result.content?.[0]?.text).toContain(
      "Error fetching blob base fee: weird failure"
    );
  });

  it("defaults to chain ID 1 when none is provided", async () => {
    const mockResponse = {
      json: async () => ({ result: "0x2" }),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    await getBlobBaseFee.handler({}); // no chainid passed

    expect(fetch).toHaveBeenCalledWith(
      INFURA_CHAIN_URLS[1], // should default to mainnet
      expect.any(Object)
    );
  });
});
