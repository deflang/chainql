import { getTransactionByHash } from "../../tools/getTransactionByHash";
import { INFURA_CHAIN_URLS } from "../../config/chains";

global.fetch = jest.fn();

describe("getTransactionByHash", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("fetches transaction successfully", async () => {
    const hash =
      "0xbb3a336e3f823ec18197f1e13ee875700f08f03e2cab75f0d0b118dabb44cba0";

    const mockTx = {
      hash,
      blockNumber: "0x112418d",
      transactionIndex: "0x0",
    };

    const mockResponse = {
      json: async () => ({ result: mockTx }),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getTransactionByHash.handler({ hash });

    expect(result.content?.[0]?.text).toContain("Transaction for hash");
    expect(result.content?.[1]?.text).toContain(hash);
    expect(fetch).toHaveBeenCalledWith(
      INFURA_CHAIN_URLS[1],
      expect.objectContaining({
        body: expect.stringContaining("\"eth_getTransactionByHash\""),
      })
    );
  });

  it("returns message when transaction not found", async () => {
    const hash =
      "0xbb3a336e3f823ec18197f1e13ee875700f08f03e2cab75f0d0b118dabb44cba0";

    const mockResponse = {
      json: async () => ({ result: null }),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getTransactionByHash.handler({ hash });

    expect(result.content?.[0]?.text).toContain("No transaction found");
  });

  it("handles unsupported chain ID", async () => {
    const result = await getTransactionByHash.handler({
      hash:
        "0xbb3a336e3f823ec18197f1e13ee875700f08f03e2cab75f0d0b118dabb44cba0",
      chainid: 9999,
    });

    expect(result.content?.[0]?.text).toContain("Unsupported chain ID: 9999");
  });

  it("handles RPC error response", async () => {
    const mockResponse = {
      json: async () => ({ error: { message: "transaction not found" } }),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getTransactionByHash.handler({
      hash:
        "0xbb3a336e3f823ec18197f1e13ee875700f08f03e2cab75f0d0b118dabb44cba0",
    });

    expect(result.content?.[0]?.text).toContain(
      "Error fetching transaction: transaction not found"
    );
  });

  it("handles network errors", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      new Error("Network down")
    );

    const result = await getTransactionByHash.handler({
      hash:
        "0xbb3a336e3f823ec18197f1e13ee875700f08f03e2cab75f0d0b118dabb44cba0",
    });

    expect(result.content?.[0]?.text).toContain(
      "Error fetching transaction: Network down"
    );
  });
});


