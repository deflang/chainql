import { getGasPrice } from "../../tools/getGasPrice";
import { INFURA_CHAIN_URLS } from "../../config/chains";

global.fetch = jest.fn();

describe("getGasPrice", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("fetches gas price successfully", async () => {
    const mockResponse = {
      json: async () => ({ result: "0x6bcc886e7" }),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getGasPrice.handler({});

    expect(result.content?.[0]?.text).toContain("Gas price (chainid 1):");
    expect(result.content?.[0]?.text).toContain("hex: 0x6bcc886e7");
    expect(result.content?.[0]?.text).toContain(
      String(parseInt("0x6bcc886e7", 16))
    );
    expect(fetch).toHaveBeenCalledWith(
      INFURA_CHAIN_URLS[1],
      expect.any(Object)
    );
  });

  it("handles unsupported chain ID", async () => {
    const result = await getGasPrice.handler({ chainid: 9999 });

    expect(result.content?.[0]?.text).toContain("Unsupported chain ID: 9999");
  });

  it("handles RPC error response", async () => {
    const mockResponse = {
      json: async () => ({ error: { message: "Some RPC error" } }),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getGasPrice.handler({});

    expect(result.content?.[0]?.text).toContain(
      "Error fetching gas price: Some RPC error"
    );
  });

  it("handles unknown RPC error when result is missing", async () => {
    const mockResponse = {
      json: async () => ({}), // no result, no error
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getGasPrice.handler({});

    expect(result.content?.[0]?.text).toContain(
      "Error fetching gas price: Unknown error"
    );
  });

  it("handles network errors", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      new Error("Network failure")
    );

    const result = await getGasPrice.handler({});

    expect(result.content?.[0]?.text).toContain(
      "Error fetching gas price: Network failure"
    );
  });

  it("defaults to chain ID 1 if not provided", async () => {
    const mockResponse = {
      json: async () => ({ result: "0x5208" }),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    await getGasPrice.handler({});

    expect(fetch).toHaveBeenCalledWith(
      INFURA_CHAIN_URLS[1],
      expect.objectContaining({
        body: expect.stringContaining('"eth_gasPrice"'),
      })
    );
  });
});

describe("getGasPrice error handling variations", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("handles Error objects correctly", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      new Error("Boom")
    );

    const result = await getGasPrice.handler({});

    expect(result.content?.[0]?.text).toContain("Boom");
  });

  it("handles string errors correctly", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      "weird failure"
    );

    const result = await getGasPrice.handler({});

    expect(result.content?.[0]?.text).toContain("weird failure");
  });

  it("handles unknown object errors correctly", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce({
      code: 123,
      info: "bad",
    });

    const result = await getGasPrice.handler({});

    expect(result.content?.[0]?.text).toContain('{"code":123,"info":"bad"}');
  });
});
