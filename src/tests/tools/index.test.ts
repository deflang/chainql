import { tools } from "../../tools";
import { getAccounts } from "../../tools/getAccounts";
import { getEthBalance } from "../../tools/getBalance.js";
import { getTransactionCount } from "../../tools/getTransactionCount.js";

describe("tools module", () => {
  it("should export an array", () => {
    expect(Array.isArray(tools)).toBe(true);
  });

  it("should contain the correct tools", () => {
    expect(tools).toContain(getEthBalance);
    expect(tools).toContain(getTransactionCount);
    expect(tools).toContain(getAccounts);
  });

  it("should have the correct length", () => {
    expect(tools).toHaveLength(3);
  });

  it("should have tools with correct names", () => {
    const names = tools.map((tool) => tool.name);
    expect(names).toContain("eth_get_balance");
    expect(names).toContain("eth_get_transaction_count");
  });
});
