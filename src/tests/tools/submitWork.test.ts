import { submitWork } from "../../tools/submitWork";

global.fetch = jest.fn();

describe("submitWork", () => {
  const params = {
    nonce: "0x0000000000000001",
    powHash:
      "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    mixDigest:
      "0xD1FE5700000000000000000000000000D1FE5700000000000000000000000000",
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("submits work successfully (true)", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      json: async () => ({ jsonrpc: "2.0", id: 1, result: true }),
    } as Response);

    const result = await submitWork.handler(params);
    expect(result.content?.[0]?.text).toContain("Work submission valid: true");
  });

  it("submits work unsuccessfully (false)", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      json: async () => ({ jsonrpc: "2.0", id: 1, result: false }),
    } as Response);

    const result = await submitWork.handler(params);
    expect(result.content?.[0]?.text).toContain("Work submission valid: false");
  });

  it("handles unsupported chain ID", async () => {
    const result = await submitWork.handler({ ...params, chainid: 9999 });
    expect(result.content?.[0]?.text).toContain("Unsupported chain ID: 9999");
  });

  it("handles RPC error response", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      json: async () => ({ error: { message: "invalid work" } }),
    } as Response);

    const result = await submitWork.handler(params);
    expect(result.content?.[0]?.text).toContain(
      "Error submitting work: invalid work"
    );
  });

  it("handles missing result in RPC response", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      json: async () => ({}),
    } as Response);

    const result = await submitWork.handler(params);
    expect(result.content?.[0]?.text).toContain(
      "Error submitting work: Unknown error"
    );
  });

  it("handles network errors", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      new Error("Network down")
    );

    const result = await submitWork.handler(params);
    expect(result.content?.[0]?.text).toContain(
      "Error submitting work: Network down"
    );
  });

  it("handles string and unknown errors correctly", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      "string error"
    );
    let result = await submitWork.handler(params);
    expect(result.content?.[0]?.text).toContain("string error");

    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce({
      code: 500,
    });
    result = await submitWork.handler(params);
    expect(result.content?.[0]?.text).toContain('{"code":500}');
  });
});
