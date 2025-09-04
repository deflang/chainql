import { getGasEstimate } from "../../tools/ethereum/getGasEstimate";
import { INFURA_CHAIN_URLS } from "../../config/chains";

global.fetch = jest.fn();

describe("getGasEstimate", () => {
  const tx = {
    from: "0x0000000000000000000000000000000000000000",
    to: "0x0000000000000000000000000000000000000001",
    value: "0x0",
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("fetches gas estimate successfully", async () => {
    const mockResponse = {
      json: async () => ({ result: "0x5208" }), // 21000 gas in hex
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getGasEstimate.handler(tx);

    expect(result.content?.[0]?.text).toContain("Estimated gas");
    expect(result.content?.[0]?.text).toContain("hex: 0x5208");
    expect(result.content?.[0]?.text).toContain(String(parseInt("0x5208", 16)));
    expect(fetch).toHaveBeenCalledWith(
      INFURA_CHAIN_URLS[1],
      expect.any(Object)
    );
  });

  it("handles unsupported chain ID", async () => {
    const result = await getGasEstimate.handler({
      ...tx,
      chainid: 9999,
    });
    expect(result.content?.[0]?.text).toContain("Unsupported chain ID");
  });

  it("handles RPC error response", async () => {
    const mockResponse = {
      json: async () => ({ error: { message: "Some RPC error" } }),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getGasEstimate.handler(tx);

    expect(result.content?.[0]?.text).toContain(
      "Error estimating gas: Some RPC error"
    );
  });

  it("handles unknown RPC error when result is missing", async () => {
    const mockResponse = {
      json: async () => ({}), // No result, no error
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getGasEstimate.handler(tx);

    expect(result.content?.[0]?.text).toContain(
      "Error estimating gas: Unknown error"
    );
  });

  it("handles network errors", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      new Error("Network failure")
    );

    const result = await getGasEstimate.handler(tx);

    expect(result.content?.[0]?.text).toContain("Error estimating gas");
    expect(result.content?.[0]?.text).toContain("Network failure");
  });

  it("defaults to chain ID 1 and latest block if not provided", async () => {
    const mockResponse = {
      json: async () => ({ result: "0x5208" }),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    await getGasEstimate.handler(tx);

    expect(fetch).toHaveBeenCalledWith(
      INFURA_CHAIN_URLS[1],
      expect.objectContaining({
        body: expect.stringContaining('"latest"'),
      })
    );
  });
});

describe("getGasEstimate transaction object construction", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("includes from and to fields if provided", async () => {
    const txParams = {
      from: "0x1111111111111111111111111111111111111111",
      to: "0x2222222222222222222222222222222222222222",
    };

    const mockResponse = {
      json: async () => ({ result: "0x5208" }),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    await getGasEstimate.handler(txParams);

    // Grab what was sent in the RPC call
    const fetchCall = (fetch as jest.MockedFunction<typeof fetch>).mock
      .calls?.[0]?.[1];
    if (!fetchCall) {
      throw new Error("fetchCall is undefined");
    }
    const body = JSON.parse(fetchCall.body as string);
    const txSent = body.params[0];

    // Test that the from/to lines were executed
    expect(txSent.from).toBe(txParams.from);
    expect(txSent.to).toBe(txParams.to);
  });

  it("omits from and to if not provided", async () => {
    const txParams = {};

    const mockResponse = {
      json: async () => ({ result: "0x5208" }),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    await getGasEstimate.handler(txParams);

    const fetchMock = (fetch as jest.MockedFunction<typeof fetch>).mock;
    expect(fetchMock.calls.length).toBeGreaterThan(0);
    const fetchCall = fetchMock.calls[0]?.[1];
    expect(fetchCall).toBeDefined();
    const body = JSON.parse((fetchCall as RequestInit).body as string);
    const txSent = body.params[0];

    expect(txSent.from).toBeUndefined();
    expect(txSent.to).toBeUndefined();
  });

  it("includes all provided fields in the transaction object", async () => {
    const txParams = {
      from: "0x1111111111111111111111111111111111111111",
      to: "0x2222222222222222222222222222222222222222",
      value: "0x100",
      data: "0xabcdef",
      gas: "0x5208",
      gasPrice: "0x3b9aca00",
      maxPriorityFeePerGas: "0x1",
      maxFeePerGas: "0x2",
      block: "latest",
    };

    const mockResponse = {
      json: async () => ({ result: "0x5208" }),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    await getGasEstimate.handler(txParams);

    // Grab the actual body sent to fetch
    const fetchMock = (fetch as jest.MockedFunction<typeof fetch>).mock;
    expect(fetchMock.calls.length).toBeGreaterThan(0);
    const fetchCall = fetchMock.calls[0]?.[1];
    expect(fetchCall).toBeDefined();
    const body = JSON.parse((fetchCall as RequestInit).body as string);

    const txSent = body.params[0];

    expect(txSent.from).toBe(txParams.from);
    expect(txSent.to).toBe(txParams.to);
    expect(txSent.value).toBe(txParams.value);
    expect(txSent.data).toBe(txParams.data);
    expect(txSent.gas).toBe(txParams.gas);
    expect(txSent.gasPrice).toBe(txParams.gasPrice);
    expect(txSent.maxPriorityFeePerGas).toBe(txParams.maxPriorityFeePerGas);
    expect(txSent.maxFeePerGas).toBe(txParams.maxFeePerGas);
  });

  it("omits fields that are not provided", async () => {
    const txParams = {
      from: "0x1111111111111111111111111111111111111111",
      to: "0x2222222222222222222222222222222222222222",
      block: "latest",
    };

    const mockResponse = {
      json: async () => ({ result: "0x5208" }),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    await getGasEstimate.handler(txParams);

    const fetchCall = (fetch as jest.MockedFunction<typeof fetch>).mock
      .calls?.[0]?.[1];
    expect(fetchCall).toBeDefined();
    const body = JSON.parse((fetchCall as RequestInit).body as string);

    const txSent = body.params[0];

    expect(txSent.from).toBe(txParams.from);
    expect(txSent.to).toBe(txParams.to);
    expect(txSent.value).toBeUndefined();
    expect(txSent.data).toBeUndefined();
    expect(txSent.gas).toBeUndefined();
    expect(txSent.gasPrice).toBeUndefined();
    expect(txSent.maxPriorityFeePerGas).toBeUndefined();
    expect(txSent.maxFeePerGas).toBeUndefined();
  });
});

describe("getGasEstimate error handling", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("handles Error objects correctly", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      new Error("Network failure")
    );

    const result = await getGasEstimate.handler({
      from: "0x1111111111111111111111111111111111111111",
      to: "0x2222222222222222222222222222222222222222",
    });

    expect(result.content?.[0]?.text).toContain("Network failure");
  });

  it("handles string errors correctly", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      "strange failure"
    );

    const result = await getGasEstimate.handler({
      from: "0x1111111111111111111111111111111111111111",
      to: "0x2222222222222222222222222222222222222222",
    });

    expect(result.content?.[0]?.text).toContain("strange failure");
  });

  it("handles unknown object errors correctly", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce({
      code: 123,
      info: "something went wrong",
    });

    const result = await getGasEstimate.handler({
      from: "0x1111111111111111111111111111111111111111",
      to: "0x2222222222222222222222222222222222222222",
    });

    expect(result.content?.[0]?.text).toContain(
      '{"code":123,"info":"something went wrong"}'
    );
  });
});
