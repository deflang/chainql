import { getWork } from "../../../tools/ethereum/getWork";
import { INFURA_CHAIN_URLS } from "../../../config/chains";

global.fetch = jest.fn();

describe("getWork", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("fetches work successfully with default chainid (1)", async () => {
    const mockWork = ["0xblockhash", "0xseedhash", "0xtarget"];

    const mockResponse = {
      json: async () => ({ result: mockWork }),
    } as Response;
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getWork.handler({});

    expect(result.content?.[0]?.text).toContain("Current mining work:");
    expect(result.content?.[0]?.text).toContain(mockWork[0]);
    expect(fetch).toHaveBeenCalledWith(
      INFURA_CHAIN_URLS[1],
      expect.objectContaining({
        body: expect.stringContaining('"eth_getWork"'),
      })
    );
  });

  it("fetches work successfully with a specific supported chainid", async () => {
    const mockWork = ["0xhash", "0xseed", "0xtarget"];
    const mockResponse = {
      json: async () => ({ result: mockWork }),
    } as Response;
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getWork.handler({ chainid: 1 });

    expect(result.content?.[0]?.text).toContain(mockWork[1]);
  });

  it("handles unsupported chain ID", async () => {
    const result = await getWork.handler({ chainid: 9999 });

    expect(result.content?.[0]?.text).toContain("Unsupported chain ID: 9999");
  });

  it("handles RPC error response", async () => {
    const mockResponse = {
      json: async () => ({
        error: { code: -32000, message: "no mining work available yet" },
      }),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getWork.handler({});

    expect(result.content?.[0]?.text).toContain(
      "Error fetching work: no mining work available yet"
    );
  });

  it("handles missing result in RPC response", async () => {
    const mockResponse = { json: async () => ({}) } as Response;
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getWork.handler({});

    expect(result.content?.[0]?.text).toContain(
      "Error fetching work: Unknown error"
    );
  });

  it("handles empty array result", async () => {
    const mockResponse = { json: async () => ({ result: [] }) } as Response;
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getWork.handler({});

    expect(result.content?.[0]?.text).toContain("Current mining work:");
    expect(result.content?.[0]?.text).toContain("[]");
  });

  it("handles network errors", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      new Error("Network down")
    );

    const result = await getWork.handler({});

    expect(result.content?.[0]?.text).toContain(
      "Error fetching work: Network down"
    );
  });
});

describe("getWork error handling variations", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("handles Error objects correctly", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      new Error("Boom")
    );

    const result = await getWork.handler({});

    expect(result.content?.[0]?.text).toContain("Boom");
  });

  it("handles string errors correctly", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      "weird failure"
    );

    const result = await getWork.handler({});

    expect(result.content?.[0]?.text).toContain("weird failure");
  });

  it("handles unknown object errors correctly", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce({
      code: 500,
      info: "internal",
    });

    const result = await getWork.handler({});

    expect(result.content?.[0]?.text).toContain(
      '{"code":500,"info":"internal"}'
    );
  });
});
