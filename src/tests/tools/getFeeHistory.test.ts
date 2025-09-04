import { getFeeHistory } from "../../tools/getFeeHistory";
import { INFURA_CHAIN_URLS } from "../../config/chains";

global.fetch = jest.fn();

describe("getFeeHistory", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("fetches fee history successfully", async () => {
    const mockResponse = {
      json: async () => ({
        result: {
          oldestBlock: "0x10",
          baseFeePerGas: ["0x1", "0x2", "0x3", "0x4", "0x5", "0x6"],
          gasUsedRatio: [0.5, 0.6, 0.7, 0.8, 0.9],
        },
      }),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getFeeHistory.handler({ blockCount: 5 });

    expect(result.content?.[0]?.text).toContain("Fee history (chainid 1):");
    expect(result.content?.[0]?.text).toContain("Oldest block: 16");
    expect(result.content?.[0]?.text).toContain("Base fees:");
    expect(fetch).toHaveBeenCalledWith(
      INFURA_CHAIN_URLS[1],
      expect.any(Object)
    );
  });

  it("handles unsupported chain ID", async () => {
    const result = await getFeeHistory.handler({
      blockCount: 5,
      chainid: 9999,
    });

    expect(result.content?.[0]?.text).toContain("Unsupported chain ID: 9999");
  });

  it("handles RPC error response", async () => {
    const mockResponse = {
      json: async () => ({ error: { message: "Some RPC error" } }),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getFeeHistory.handler({ blockCount: 5 });

    expect(result.content?.[0]?.text).toContain(
      "Error fetching fee history: Some RPC error"
    );
  });

  it("handles unknown RPC error when result is missing", async () => {
    const mockResponse = {
      json: async () => ({}), // no result or error
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getFeeHistory.handler({ blockCount: 5 });

    expect(result.content?.[0]?.text).toContain(
      "Error fetching fee history: Unknown error"
    );
  });

  it("handles network errors", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      new Error("Network failure")
    );

    const result = await getFeeHistory.handler({ blockCount: 5 });

    expect(result.content?.[0]?.text).toContain(
      "Error fetching fee history: Network failure"
    );
  });

  it("defaults to chain ID 1 and newestBlock 'latest' if not provided", async () => {
    const mockResponse = {
      json: async () => ({
        result: {
          oldestBlock: "0x20",
          baseFeePerGas: ["0x10"],
          gasUsedRatio: [0.5],
        },
      }),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    await getFeeHistory.handler({ blockCount: 5 });

    expect(fetch).toHaveBeenCalledWith(
      INFURA_CHAIN_URLS[1],
      expect.objectContaining({
        body: expect.stringContaining('"latest"'),
      })
    );
  });
});

describe("getFeeHistory error handling variations", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("handles Error objects correctly", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      new Error("Boom")
    );

    const result = await getFeeHistory.handler({ blockCount: 5 });

    expect(result.content?.[0]?.text).toContain("Boom");
  });

  it("handles string errors correctly", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      "weird failure"
    );

    const result = await getFeeHistory.handler({ blockCount: 5 });

    expect(result.content?.[0]?.text).toContain("weird failure");
  });

  it("handles unknown object errors correctly", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce({
      code: 123,
      info: "bad",
    });

    const result = await getFeeHistory.handler({ blockCount: 5 });

    expect(result.content?.[0]?.text).toContain('{"code":123,"info":"bad"}');
  });
});
