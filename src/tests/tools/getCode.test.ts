import { getCode } from "../../tools/ethereum/getCode";
import { INFURA_CHAIN_URLS } from "../../config/chains";

global.fetch = jest.fn();

describe("getCode", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("fetches contract bytecode successfully", async () => {
    const address = "0x06012c8cf97bead5deae237070f9587f8e7a266d";
    const block = "0x65a8db";

    const mockResponse = {
      json: async () => ({ result: "0x60606040" }),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getCode.handler({ address, block });

    expect(result.content?.[0]?.text).toContain("Bytecode for");
    expect(result.content?.[1]?.text).toBe("0x60606040");
    expect(fetch).toHaveBeenCalledWith(
      INFURA_CHAIN_URLS[1],
      expect.objectContaining({
        body: expect.stringContaining("\"eth_getCode\""),
      })
    );
  });

  it("handles unsupported chain ID", async () => {
    const result = await getCode.handler({
      address: "0xabc",
      block: "latest",
      chainid: 9999,
    });

    expect(result.content?.[0]?.text).toContain("Unsupported chain ID: 9999");
  });

  it("handles RPC error response", async () => {
    const mockResponse = {
      json: async () => ({ error: { message: "execution reverted" } }),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getCode.handler({
      address: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
      block: "latest",
    });

    expect(result.content?.[0]?.text).toContain(
      "Error fetching contract code: execution reverted"
    );
  });

  it("handles unknown RPC response (no result, no error)", async () => {
    const mockResponse = {
      json: async () => ({}),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getCode.handler({
      address: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
      block: "latest",
    });

    expect(result.content?.[0]?.text).toContain(
      "Error fetching contract code: Unknown error"
    );
  });

  it("handles network errors", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      new Error("Network down")
    );

    const result = await getCode.handler({
      address: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
      block: "latest",
    });

    expect(result.content?.[0]?.text).toContain(
      "Error fetching contract code: Network down"
    );
  });

  it("calculates byteLength correctly for bytecode without 0x prefix", async () => {
    const address = "0x1234567890123456789012345678901234567890";
    const block = "latest";
  
    const mockResponse = {
      json: async () => ({ result: "60606040" }), // no 0x
    } as Response;
  
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );
  
    const result = await getCode.handler({ address, block });
  
    expect(result.content?.[0]?.text).toContain("Bytecode for");
    expect(result.content?.[0]?.text).toContain("length 4 bytes"); // 60606040 => 4 bytes
    expect(result.content?.[1]?.text).toBe("60606040");
  });
  
  it("handles string error thrown in fetch", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce("String error");
  
    const result = await getCode.handler({
      address: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
      block: "latest",
    });
  
    expect(result.content?.[0]?.text).toContain("Error fetching contract code: String error");
  });
  
  it("handles unknown type error thrown in fetch", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce({ some: "object" });
  
    const result = await getCode.handler({
      address: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
      block: "latest",
    });
  
    expect(result.content?.[0]?.text).toContain(
      'Error fetching contract code: {"some":"object"}'
    );
  });  
});


