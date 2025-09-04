import { getUncleByBlockNumberAndIndex } from "../../../tools/ethereum/getUncleByBlockNumberAndIndex";
import { INFURA_CHAIN_URLS } from "../../../config/chains";

global.fetch = jest.fn();

describe("getUncleByBlockNumberAndIndex", () => {
  const blockNumberOrTag = "0x29c";
  const index = "0x0";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("fetches uncle successfully with default chainid", async () => {
    const mockUncle = {
      number: "0x299",
      hash: "0x932bdf",
      parentHash: "0xa779",
    };
    const mockResponse = {
      json: async () => ({ result: mockUncle }),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getUncleByBlockNumberAndIndex.handler({
      blockNumberOrTag,
      index,
    });

    expect(result.content?.[0]?.text).toContain(
      `Uncle for block ${blockNumberOrTag} index ${index} on chainid 1`
    );
    expect(result.content?.[1]?.text).toContain("0x299");
    expect(fetch).toHaveBeenCalledWith(
      INFURA_CHAIN_URLS[1],
      expect.objectContaining({
        body: expect.stringContaining('"eth_getUncleByBlockNumberAndIndex"'),
      })
    );
  });

  it("fetches uncle successfully with a specific supported chainid", async () => {
    const mockUncle = { number: "0x2aa", hash: "0xabc", parentHash: "0xdef" };
    const mockResponse = {
      json: async () => ({ result: mockUncle }),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getUncleByBlockNumberAndIndex.handler({
      blockNumberOrTag,
      index,
      chainid: 1,
    });

    expect(result.content?.[1]?.text).toContain("0x2aa");
  });

  it("returns message when uncle not found (result === null)", async () => {
    const mockResponse = { json: async () => ({ result: null }) } as Response;
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getUncleByBlockNumberAndIndex.handler({
      blockNumberOrTag,
      index,
    });

    expect(result.content?.[0]?.text).toContain(
      `No uncle found at index ${index} for block ${blockNumberOrTag} on chainid 1`
    );
  });

  it("handles unsupported chain ID", async () => {
    const result = await getUncleByBlockNumberAndIndex.handler({
      blockNumberOrTag,
      index,
      chainid: 9999,
    });

    expect(result.content?.[0]?.text).toContain("Unsupported chain ID: 9999");
  });

  it("handles RPC error response", async () => {
    const mockResponse = {
      json: async () => ({ error: { message: "uncle not found" } }),
    } as Response;
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getUncleByBlockNumberAndIndex.handler({
      blockNumberOrTag,
      index,
    });

    expect(result.content?.[0]?.text).toContain(
      "Error fetching uncle: uncle not found"
    );
  });

  it("handles unknown RPC response (no result, no error)", async () => {
    const mockResponse = { json: async () => ({}) } as Response;
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getUncleByBlockNumberAndIndex.handler({
      blockNumberOrTag,
      index,
    });

    expect(result.content?.[0]?.text).toContain(
      "Error fetching uncle: Unknown error"
    );
  });

  it("handles network errors", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      new Error("Network down")
    );

    const result = await getUncleByBlockNumberAndIndex.handler({
      blockNumberOrTag,
      index,
    });

    expect(result.content?.[0]?.text).toContain(
      "Error fetching uncle: Network down"
    );
  });
});

describe("getUncleByBlockNumberAndIndex error handling variations", () => {
  const blockNumberOrTag = "0x29c";
  const index = "0x0";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("handles Error objects correctly", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      new Error("Boom")
    );

    const result = await getUncleByBlockNumberAndIndex.handler({
      blockNumberOrTag,
      index,
    });

    expect(result.content?.[0]?.text).toContain("Boom");
  });

  it("handles string errors correctly", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockImplementationOnce(() =>
      Promise.reject("weird failure")
    );

    const result = await getUncleByBlockNumberAndIndex.handler({
      blockNumberOrTag,
      index,
    });

    expect(result.content?.[0]?.text).toContain("weird failure");
  });

  it("handles unknown object errors correctly", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce({
      code: 500,
      info: "internal",
    });

    const result = await getUncleByBlockNumberAndIndex.handler({
      blockNumberOrTag,
      index,
    });

    expect(result.content?.[0]?.text).toContain(
      '{"code":500,"info":"internal"}'
    );
  });
});
