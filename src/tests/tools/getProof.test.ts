import { getProof } from "../../tools/ethereum/getProof";
import { INFURA_CHAIN_URLS } from "../../config/chains";

global.fetch = jest.fn();

describe("getProof", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("fetches proof successfully", async () => {
    const address = "0x7F0d15C7FAae65896648C8273B6d7E43f58Fa842";
    const storageKeys = [
      "0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421",
    ];
    const block = "latest";

    const mockResult = {
      address: address.toLowerCase(),
      balance: "0x0",
      codeHash: "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
      nonce: "0x0",
      storageHash: "0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421",
      accountProof: ["0xabc"],
      storageProof: [
        {
          key: storageKeys[0],
          proof: [],
          value: "0x0",
        },
      ],
    };

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      json: async () => ({ result: mockResult }),
    } as Response);

    const result = await getProof.handler({ address, storageKeys, block });

    expect(result.content?.[0]?.text).toContain("Fetched proof for");
    expect(result.content?.[1]?.text).toContain(address.toLowerCase());
    expect(fetch).toHaveBeenCalledWith(
      INFURA_CHAIN_URLS[1],
      expect.objectContaining({
        body: expect.stringContaining("\"eth_getProof\""),
      })
    );
  });

  it("handles unsupported chain ID", async () => {
    const result = await getProof.handler({
      address: "0xabc",
      storageKeys: ["0x1"],
      block: "latest",
      chainid: 9999,
    });

    expect(result.content?.[0]?.text).toContain("Unsupported chain ID: 9999");
  });

  it("handles RPC error response", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      json: async () => ({ error: { message: "query timeout exceeded" } }),
    } as Response);

    const result = await getProof.handler({
      address: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
      storageKeys: ["0x1"],
      block: "latest",
    });

    expect(result.content?.[0]?.text).toContain(
      "Error fetching proof: query timeout exceeded"
    );
  });

  it("handles unknown RPC response (no result, no error)", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      json: async () => ({}),
    } as Response);

    const result = await getProof.handler({
      address: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
      storageKeys: ["0x1"],
      block: "latest",
    });

    expect(result.content?.[0]?.text).toContain("Error fetching proof: Unknown error");
  });

  it("handles network errors (Error instance)", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      new Error("Network down")
    );

    const result = await getProof.handler({
      address: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
      storageKeys: ["0x1"],
      block: "latest",
    });

    expect(result.content?.[0]?.text).toContain(
      "Error fetching proof: Network down"
    );
  });

  it("handles network errors (string rejection)", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce("Network down string");

    const result = await getProof.handler({
      address: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
      storageKeys: ["0x1"],
      block: "latest",
    });

    expect(result.content?.[0]?.text).toContain(
      "Error fetching proof: Network down string"
    );
  });

  it("handles network errors (object rejection)", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce({ code: 123 });

    const result = await getProof.handler({
      address: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
      storageKeys: ["0x1"],
      block: "latest",
    });

    expect(result.content?.[0]?.text).toContain(
      'Error fetching proof: {"code":123}'
    );
  });
});
