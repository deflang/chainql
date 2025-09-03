import { getAccounts } from "../../tools/getAccounts";
import { INFURA_CHAIN_URLS } from "../../config/chains";

global.fetch = jest.fn();

describe("getAccounts", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("fetches accounts successfully (empty array expected for Infura)", async () => {
    // Typed mock response
    const mockResponse = {
      json: async () => ({ result: [] }),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getAccounts.handler({ chainid: 1 });

    expect(result.content?.[0]?.text).toContain("Accounts");
    expect(result.content?.[0]?.text).toContain("[]");
    expect(fetch).toHaveBeenCalledWith(
      INFURA_CHAIN_URLS[1],
      expect.any(Object)
    );
  });

  it("handles unsupported chain ID", async () => {
    const result = await getAccounts.handler({ chainid: 9999 });

    expect(result.content?.[0]?.text).toContain(
      "Unsupported or missing URL for chain ID 9999"
    );
  });

  it("handles RPC error response", async () => {
    const mockResponse = {
      json: async () => ({ error: { message: "Some RPC error" } }),
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getAccounts.handler({ chainid: 1 });

    expect(result.content?.[0]?.text).toContain(
      "Error fetching accounts: Some RPC error"
    );
  });

  it("handles unknown RPC error when result is missing", async () => {
    const mockResponse = {
      json: async () => ({}), // No result, no error
    } as Response;

    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );

    const result = await getAccounts.handler({ chainid: 1 });

    expect(result.content?.[0]?.text).toContain(
      "Error fetching accounts: Unknown error"
    );
  });

  it("handles network errors", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      new Error("Network failure")
    );

    const result = await getAccounts.handler({ chainid: 1 });

    expect(result.content?.[0]?.text).toContain("Error fetching accounts");
    expect(result.content?.[0]?.text).toContain("Network failure");
  });

  it("handles thrown non-Error values", async () => {
    // Reject fetch with a plain string instead of an Error
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      "weird error"
    );

    const result = await getAccounts.handler({ chainid: 1 });

    expect(result.content?.[0]?.text).toContain(
      "Error fetching accounts: weird error"
    );
  });

  it("defaults to chain ID 1 when none is provided", async () => {
    const mockResponse = {
      json: async () => ({ result: [] }),
    } as Response;
  
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      mockResponse
    );
  
    const result = await getAccounts.handler({}); // no chainid passed
  
    expect(result.content?.[0]?.text).toContain("Accounts");
    expect(fetch).toHaveBeenCalledWith(
      INFURA_CHAIN_URLS[1],
      expect.any(Object) // ensures default chainid=1 was used
    );
  });
  
});
