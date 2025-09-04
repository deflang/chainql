import { sendRawTransaction } from "../../tools/ethereum/sendRawTransaction";
import { INFURA_CHAIN_URLS } from "../../config/chains";

global.fetch = jest.fn();

describe("eth_sendRawTransaction", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("sends raw transaction successfully", async () => {
    const mockResponse = {
      json: async () => ({
        result:
          "0xe670ec64341771606e55d6b4ca35a1a6b75ee3d5145a99d05921026d1527331",
      }),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockResponse);

    const signedTx = "0xdeadbeef";
    const result = await sendRawTransaction.handler({ signedTx });

    expect(result.content?.[0]?.text).toContain("Transaction broadcasted");
    expect(result.content?.[0]?.text).toContain(
      "0xe670ec64341771606e55d6b4ca35a1a6b75ee3d5145a99d05921026d1527331"
    );
    expect(fetch).toHaveBeenCalledWith(
      INFURA_CHAIN_URLS[1],
      expect.objectContaining({
        body: expect.stringContaining('"eth_sendRawTransaction"'),
      })
    );
  });

  it("handles unsupported chain ID", async () => {
    const result = await sendRawTransaction.handler({
      signedTx: "0xdeadbeef",
      chainid: 9999,
    });

    expect(result.content?.[0]?.text).toContain("Unsupported chain ID: 9999");
  });

  it("handles RPC error response with revert reason", async () => {
    const mockResponse = {
      json: async () => ({
        error: { message: "execution reverted: insufficient balance" },
      }),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockResponse);

    const result = await sendRawTransaction.handler({ signedTx: "0xdeadbeef" });

    expect(result.content?.[0]?.text).toContain(
      "Error sending raw transaction: execution reverted: insufficient balance"
    );
  });

  it("handles unknown RPC error (no result, no error)", async () => {
    const mockResponse = { json: async () => ({}) } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockResponse);

    const result = await sendRawTransaction.handler({ signedTx: "0xdeadbeef" });

    expect(result.content?.[0]?.text).toContain(
      "Error sending raw transaction: Unknown error"
    );
  });

  it("handles network error (Error object)", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      new Error("Network down")
    );

    const result = await sendRawTransaction.handler({ signedTx: "0xdeadbeef" });

    expect(result.content?.[0]?.text).toContain(
      "Error sending raw transaction: Network down"
    );
  });

  it("handles network error (string)", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      "failure string"
    );

    const result = await sendRawTransaction.handler({ signedTx: "0xdeadbeef" });

    expect(result.content?.[0]?.text).toContain(
      "Error sending raw transaction: failure string"
    );
  });

  it("handles network error (plain object)", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce({
      foo: "bar",
    });

    const result = await sendRawTransaction.handler({ signedTx: "0xdeadbeef" });

    expect(result.content?.[0]?.text).toContain(
      'Error sending raw transaction: {"foo":"bar"}'
    );
  });
});
