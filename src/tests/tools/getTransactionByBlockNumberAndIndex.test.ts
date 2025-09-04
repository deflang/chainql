import { getTransactionByBlockNumberAndIndex } from "../../tools/getTransactionByBlockNumberAndIndex";
import { INFURA_CHAIN_URLS } from "../../config/chains";

global.fetch = jest.fn();

describe("getTransactionByBlockNumberAndIndex", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("fetches transaction successfully", async () => {
    const blockNumberOrTag = "0x5BAD55";
    const index = "0x0";

    const mockTx = {
      hash: "0x140fc3229057d6a484227cbcae16331f586310f68f2095dbc75b3af53d4874bd",
      blockNumber: "0x11dca94",
      transactionIndex: index,
    };

    const mockResponse = {
      json: async () => ({ result: mockTx }),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getTransactionByBlockNumberAndIndex.handler({
      blockNumberOrTag,
      index,
    });

    expect(result.content?.[0]?.text).toContain("Transaction for block");
    expect(result.content?.[1]?.text).toContain(mockTx.hash);
    expect(fetch).toHaveBeenCalledWith(
      INFURA_CHAIN_URLS[1],
      expect.objectContaining({
        body: expect.stringContaining(
          "\"eth_getTransactionByBlockNumberAndIndex\""
        ),
      })
    );
  });

  it("returns message when transaction not found", async () => {
    const blockNumberOrTag = "latest";
    const index = "0x2";

    const mockResponse = {
      json: async () => ({ result: null }),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getTransactionByBlockNumberAndIndex.handler({
      blockNumberOrTag,
      index,
    });

    expect(result.content?.[0]?.text).toContain("No transaction found");
  });

  it("handles unsupported chain ID", async () => {
    const result = await getTransactionByBlockNumberAndIndex.handler({
      blockNumberOrTag: "0x1",
      index: "0x0",
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

    const result = await getTransactionByBlockNumberAndIndex.handler({
      blockNumberOrTag: "0x1",
      index: "0x0",
    });

    expect(result.content?.[0]?.text).toContain(
      "Error fetching transaction: transaction not found"
    );
  });

  it("handles network errors", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      new Error("Network down")
    );

    const result = await getTransactionByBlockNumberAndIndex.handler({
      blockNumberOrTag: "0x1",
      index: "0x0",
    });

    expect(result.content?.[0]?.text).toContain(
      "Error fetching transaction: Network down"
    );
  });
});


