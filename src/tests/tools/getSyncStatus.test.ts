import { getSyncStatus } from "../../tools/getSyncStatus";

global.fetch = jest.fn();

describe("getSyncStatus tool", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns not syncing (false) correctly", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      json: async () => ({ jsonrpc: "2.0", id: 1, result: false }),
    } as Response);

    const result = await getSyncStatus.handler({});
    expect(result.content?.[0]?.text).toBe("Node sync status: false");
  });

  it("handles unsupported chain ID", async () => {
    const result = await getSyncStatus.handler({ chainid: 9999 });
    expect(result.content?.[0]?.text).toContain("Unsupported chain ID: 9999");
  });

  it("handles RPC error response", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      json: async () => ({
        error: { code: -32000, message: "RPC failure" },
      }),
    } as Response);

    const result = await getSyncStatus.handler({});
    expect(result.content?.[0]?.text).toContain(
      "Error fetching sync status: RPC failure"
    );
  });

  it("handles missing result in RPC response", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      json: async () => ({}),
    } as Response);

    const result = await getSyncStatus.handler({});
    expect(result.content?.[0]?.text).toContain(
      "Error fetching sync status: Unknown error"
    );
  });

  it("handles network errors with Error instance", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      new Error("Network down")
    );

    const result = await getSyncStatus.handler({});
    expect(result.content?.[0]?.text).toContain(
      "Error fetching sync status: Network down"
    );
  });

  it("handles string error rejections", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      "string failure"
    );

    const result = await getSyncStatus.handler({});
    expect(result.content?.[0]?.text).toContain(
      "Error fetching sync status: string failure"
    );
  });

  it("handles unknown object error rejections", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce({
      code: 500,
      info: "bad things",
    });

    const result = await getSyncStatus.handler({});
    expect(result.content?.[0]?.text).toContain(
      'Error fetching sync status: {"code":500,"info":"bad things"}'
    );
  });
});
