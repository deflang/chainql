import { getClientVersion } from "../../tools/getClientVersion";

global.fetch = jest.fn();

describe("getClientVersion tool", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns client version string correctly", async () => {
    const mockVersion = "Geth/v1.11.6/linux-amd64/go1.20.3";

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      json: async () => ({ jsonrpc: "2.0", id: 1, result: mockVersion }),
    } as Response);

    const result = await getClientVersion.handler({});
    expect(result.content?.[0]?.text).toContain(
      `Client version: ${mockVersion}`
    );
  });

  it("handles unsupported chain ID", async () => {
    const result = await getClientVersion.handler({ chainid: 9999 });
    expect(result.content?.[0]?.text).toContain("Unsupported chain ID: 9999");
  });

  it("handles RPC error response", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      json: async () => ({
        error: { code: -32000, message: "RPC failure" },
      }),
    } as Response);

    const result = await getClientVersion.handler({});
    expect(result.content?.[0]?.text).toContain(
      "Error fetching client version: RPC failure"
    );
  });

  it("handles missing result in RPC response", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      json: async () => ({}),
    } as Response);

    const result = await getClientVersion.handler({});
    expect(result.content?.[0]?.text).toContain(
      "Error fetching client version: Unknown error"
    );
  });

  it("handles network errors with Error instance", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      new Error("Network down")
    );

    const result = await getClientVersion.handler({});
    expect(result.content?.[0]?.text).toContain(
      "Error fetching client version: Network down"
    );
  });

  it("handles string error rejections", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      "string failure"
    );

    const result = await getClientVersion.handler({});
    expect(result.content?.[0]?.text).toContain(
      "Error fetching client version: string failure"
    );
  });

  it("handles unknown object error rejections", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce({
      code: 500,
      info: "server issue",
    });

    const result = await getClientVersion.handler({});
    expect(result.content?.[0]?.text).toContain(
      'Error fetching client version: {"code":500,"info":"server issue"}'
    );
  });
});
