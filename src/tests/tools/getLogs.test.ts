import { getLogs } from "../../tools/getLogs";
import { INFURA_CHAIN_URLS } from "../../config/chains";

global.fetch = jest.fn();

describe("getLogs", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("rejects invalid combination of blockHash and from/to block", async () => {
    const result = await getLogs.handler({
      blockHash: "0xabc",
      fromBlock: "0x1",
      toBlock: "0x2",
    });

    expect(result.content?.[0]?.text).toContain("blockHash cannot be combined");
  });

  it("fetches logs by blockHash", async () => {
    const topic =
      "0x241ea03ca20251805084d27d4440371c34a0b85ff108f6bb5611248f73818b80";
    const mockLogs = [
      {
        address: "0x1",
        topics: [topic],
        data: "0x",
      },
    ];
    const mockResponse = {
      json: async () => ({ result: mockLogs }),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getLogs.handler({
      blockHash:
        "0x7c5a35e9cb3e8ae0e221ab470abae9d446c3a5626ce6689fc777dcffcab52c70",
      topics: [topic],
    });

    expect(result.content?.[0]?.text).toContain("Fetched 1 logs");
    expect(result.content?.[1]?.text).toContain(topic);
    expect(fetch).toHaveBeenCalledWith(
      INFURA_CHAIN_URLS[1],
      expect.objectContaining({
        body: expect.stringContaining('"eth_getLogs"'),
      })
    );
  });

  it("fetches logs by block range and address", async () => {
    const mockLogs: unknown[] = [];
    const mockResponse = {
      json: async () => ({ result: mockLogs }),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getLogs.handler({
      address: "0x06012c8cf97bead5deae237070f9587f8e7a266d",
      fromBlock: "0x5c29fb",
      toBlock: "0x5c2a23",
      topics: ["0x241ea03c..."],
    });

    expect(result.content?.[0]?.text).toContain("Fetched 0 logs");
    expect(fetch).toHaveBeenCalledWith(
      INFURA_CHAIN_URLS[1],
      expect.any(Object)
    );
  });

  it("handles unsupported chain ID", async () => {
    const result = await getLogs.handler({
      chainid: 9999,
      fromBlock: "latest",
      toBlock: "latest",
    });

    expect(result.content?.[0]?.text).toContain("Unsupported chain ID: 9999");
  });

  it("handles RPC error response", async () => {
    const mockResponse = {
      json: async () => ({ error: { message: "query timeout exceeded" } }),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getLogs.handler({ fromBlock: "0x1", toBlock: "0x2" });

    expect(result.content?.[0]?.text).toContain(
      "Error fetching logs: query timeout exceeded"
    );
  });

  it("handles network errors", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      new Error("Network down")
    );

    const result = await getLogs.handler({
      fromBlock: "latest",
      toBlock: "latest",
    });

    expect(result.content?.[0]?.text).toContain(
      "Error fetching logs: Network down"
    );
  });

  it("fetches logs with multiple addresses", async () => {
    const addresses = ["0x1", "0x2"];
    const mockLogs = [{ address: "0x1", topics: [], data: "0x" }];
    const mockResponse = {
      json: async () => ({ result: mockLogs }),
    } as Response;
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getLogs.handler({
      address: addresses,
      fromBlock: "0x1",
      toBlock: "0x2",
    });

    expect(result.content?.[0]?.text).toContain("Fetched 1 logs");
    expect(result.content?.[1]?.text).toContain(JSON.stringify(mockLogs));
  });

  it("fetches logs with empty topics array", async () => {
    const mockLogs: unknown[] = [];
    const mockResponse = {
      json: async () => ({ result: mockLogs }),
    } as Response;
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getLogs.handler({
      fromBlock: "0x1",
      toBlock: "0x2",
      topics: [],
    });

    expect(result.content?.[0]?.text).toContain("Fetched 0 logs");
  });

  it("handles RPC response where result is not an array", async () => {
    const mockResponse = { json: async () => ({ result: null }) } as Response;
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getLogs.handler({ fromBlock: "0x1", toBlock: "0x2" });

    expect(result.content?.[0]?.text).toContain("Error fetching logs");
  });

  it("handles network errors with string rejection", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      "Network failure"
    );

    const result = await getLogs.handler({ fromBlock: "0x1", toBlock: "0x2" });

    expect(result.content?.[0]?.text).toContain(
      "Error fetching logs: Network failure"
    );
  });

  it("handles network errors with object rejection", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce({
      code: 123,
    });

    const result = await getLogs.handler({ fromBlock: "0x1", toBlock: "0x2" });

    expect(result.content?.[0]?.text).toContain(
      'Error fetching logs: {"code":123}'
    );
  });

  it("uses default fromBlock/toBlock when not provided", async () => {
    const mockLogs = [{ address: "0x1", topics: [], data: "0x" }];
    const mockResponse = {
      json: async () => ({ result: mockLogs }),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getLogs.handler({}); // no fromBlock, no toBlock, no blockHash

    expect(result.content?.[0]?.text).toContain("Fetched 1 logs on chainid 1");
    expect(fetch).toHaveBeenCalledWith(
      INFURA_CHAIN_URLS[1],
      expect.objectContaining({
        body: expect.stringContaining('"fromBlock":"latest"'),
      })
    );
    expect(fetch).toHaveBeenCalledWith(
      INFURA_CHAIN_URLS[1],
      expect.objectContaining({
        body: expect.stringContaining('"toBlock":"latest"'),
      })
    );
  });

  it("handles non-array result from RPC", async () => {
    const mockResponse = { json: async () => ({ result: {} }) } as Response;
  
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockResponse);
  
    const result = await getLogs.handler({ fromBlock: "0x1", toBlock: "0x2" });
  
    expect(result.content?.[0]?.text).toContain("Fetched 0 logs on chainid 1");
  });  
});
