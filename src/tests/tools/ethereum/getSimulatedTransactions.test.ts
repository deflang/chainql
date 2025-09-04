import { getSimulatedTransactions } from "../../../tools/ethereum/getSimulatedTransactions";
import { INFURA_CHAIN_URLS } from "../../../config/chains";

type BlockStateCall = Parameters<
  typeof getSimulatedTransactions.handler
>[0]["blockStateCalls"][number];

global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

describe("eth_get_simulated_transactions", () => {
  const validBlockStateCalls: BlockStateCall[] = [
    {
      calls: [
        {
          to: "0x742d35Cc6635C0532925a3b8D400d3C8fbF6F2C5",
          data: "0x",
          value: "0x1",
        },
      ],
    },
  ];

  const mockRpcResponse = <T>(result: T): Response => ({
    json: async () => result,
  } as unknown as Response);

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeAll(() => {
    // Ensure both mainnet and sepolia always have a valid URL
    INFURA_CHAIN_URLS[1] ||= "https://mainnet.infura.io/v3/test";
    INFURA_CHAIN_URLS[11155111] ||= "https://sepolia.infura.io/v3/test";
  });

  it("fetches simulated transactions successfully", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockRpcResponse({ result: [{ calls: [{ status: "0x1", gasUsed: "0x5208" }] }] })
    );

    const result = await getSimulatedTransactions.handler({
      blockStateCalls: validBlockStateCalls,
    });

    expect(result.content?.[0]?.text).toContain("Simulated 1 blockStateCall(s) on chainid 1");
    expect(result.content?.[0]?.text).toContain("(default block)");
    expect(result.content?.[1]?.text).toContain('"calls"');
    expect(fetch).toHaveBeenCalled();
  });

  it("uses custom chainid", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockRpcResponse({ result: [] }));

    const result = await getSimulatedTransactions.handler({
      blockStateCalls: validBlockStateCalls,
      chainid: 11155111,
    });

    expect(result.content?.[0]?.text).toContain("Simulated 0 blockStateCall(s) on chainid 11155111");
    expect(fetch).toHaveBeenCalled();
  });

  it("handles network errors", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(new Error("Network failure"));

    const result = await getSimulatedTransactions.handler({
      blockStateCalls: validBlockStateCalls,
    });

    expect(result.content?.[0]?.text).toContain("Error simulating: Network failure");
  });

  it("handles RPC error response", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockRpcResponse({ error: { message: "simulation failed" } })
    );

    const result = await getSimulatedTransactions.handler({
      blockStateCalls: validBlockStateCalls,
    });

    expect(result.content?.[0]?.text).toContain("Error simulating: simulation failed");
  });

  it("handles unknown RPC response", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockRpcResponse({}));

    const result = await getSimulatedTransactions.handler({
      blockStateCalls: validBlockStateCalls,
    });

    expect(result.content?.[0]?.text).toContain("Error simulating: Unknown error");
  });

  it("builds correct RPC request body with optional parameters", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockRpcResponse({ result: [] }));

    await getSimulatedTransactions.handler({
      blockStateCalls: validBlockStateCalls,
      validation: true,
      traceTransfers: false,
      returnFullTransactionObjects: true,
      blockParameter: "latest",
      chainid: 11155111,
    });

    const fetchCalls = (fetch as jest.MockedFunction<typeof fetch>).mock.calls;
    expect(fetchCalls.length).toBeGreaterThan(0);

    const body = JSON.parse(fetchCalls[0]![1]?.body as string);
    expect(body.params).toEqual([
      {
        blockStateCalls: validBlockStateCalls,
        validation: true,
        traceTransfers: false,
        returnFullTransactionObjects: true,
      },
      "latest",
    ]);
  });

  it("returns error content when too many blockStateCalls (>16)", async () => {
    const tooMany = Array(17).fill(validBlockStateCalls[0]);

    const result = await getSimulatedTransactions.handler({
      blockStateCalls: tooMany,
    });

    expect(result.content?.[0]?.text).toContain("Too many blockStateCalls: maximum is 16");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns error content when blockStateCalls is invalid", async () => {
    const result = await getSimulatedTransactions.handler({
      blockStateCalls: "invalid" as unknown as BlockStateCall[],
    });

    expect(result.content?.[0]?.text).toContain("Invalid params: blockStateCalls must be an array");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns error content when chain ID has no URL", async () => {
    const result = await getSimulatedTransactions.handler({
        blockStateCalls: validBlockStateCalls,
        validation: true,
        traceTransfers: false,
        returnFullTransactionObjects: true,
        blockParameter: "latest",
        chainid: 111244,
      });
    expect(result.content?.[0]?.text).toContain("Unsupported chain ID: 111244");
  });
});

global.fetch = jest.fn();

describe("eth_get_simulated_transactions - error scenarios", () => {
  const validBlockStateCalls = [
    {
      calls: [
        {
          to: "0x742d35Cc6635C0532925a3b8D400d3C8fbF6F2C5",
          data: "0x",
          value: "0x1",
        },
      ],
    },
  ];

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns Unsupported chain ID when url is missing", async () => {
    const result = await getSimulatedTransactions.handler({
      blockStateCalls: validBlockStateCalls,
      chainid: 999999, // no URL in INFURA_CHAIN_URLS
    });

    expect(result.content?.[0]?.text).toContain("Unsupported chain ID: 999999");
  });

  it("handles fetch rejection with Error object", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      new Error("Error object")
    );

    const result = await getSimulatedTransactions.handler({
      blockStateCalls: validBlockStateCalls,
    });

    expect(result.content?.[0]?.text).toContain("Error simulating: Error object");
  });

  it("handles fetch rejection with string", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      "String rejection"
    );

    const result = await getSimulatedTransactions.handler({
      blockStateCalls: validBlockStateCalls,
    });

    expect(result.content?.[0]?.text).toContain("Error simulating: String rejection");
  });

  it("handles fetch rejection with plain object", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce({
      code: 500,
      message: "Plain object error",
    });

    const result = await getSimulatedTransactions.handler({
      blockStateCalls: validBlockStateCalls,
    });

    expect(result.content?.[0]?.text).toContain(
      'Error simulating: {"code":500,"message":"Plain object error"}'
    );
  });

  it("calculates count when result is an array", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      json: async () => ({ result: [{ calls: [] }, { calls: [] }] }),
    } as Response);

    const result = await getSimulatedTransactions.handler({
      blockStateCalls: validBlockStateCalls,
    });

    expect(result.content?.[0]?.text).toContain("Simulated 2 blockStateCall(s)");
  });

  it("calculates count when result is not an array", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      json: async () => ({ result: "not an array" }),
    } as Response);

    const result = await getSimulatedTransactions.handler({
      blockStateCalls: validBlockStateCalls,
    });

    expect(result.content?.[0]?.text).toContain("Simulated 0 blockStateCall(s)");
  });
});
