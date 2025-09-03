describe("INFURA_CHAIN_URLS", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules(); // clear module cache
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV; // restore env
  });

  test("throws error if INFURA_API_KEY is not set", async () => {
    process.env.INFURA_API_KEY = "";

    await expect(async () => {
      await import("../../config/chains");
    }).rejects.toThrow("INFURA_API_KEY is not set");
  });

  test("generates correct URLs when INFURA_API_KEY is set", async () => {
    process.env.INFURA_API_KEY = "test_key";

    const module = await import("../../config/chains");
    const { INFURA_CHAIN_URLS } = module;

    expect(INFURA_CHAIN_URLS[1]).toBe("https://mainnet.infura.io/v3/test_key");
    expect(INFURA_CHAIN_URLS[137]).toBe(
      "https://polygon-mainnet.infura.io/v3/test_key"
    );
  });
});
