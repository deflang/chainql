import { tools } from "../../tools";
import { getAccounts } from "../../tools/getAccounts";
import { getEthBalance } from "../../tools/getBalance.js";
import { getBlobBaseFee } from "../../tools/getBlobBaseFee";
import { getBlockByHash } from "../../tools/getBlockByHash";
import { getBlockByNumber } from "../../tools/getBlockByNumber";
import { getBlockNumber } from "../../tools/getBlockNumber";
import { getBlockReceipts } from "../../tools/getBlockReceipts";
import { getBlockTransactionCountByHash } from "../../tools/getBlockTransactionCountByHash";
import { getBlockTransactionCountByNumber } from "../../tools/getBlockTransactionCountByNumber";
import { getCode } from "../../tools/getCode";
import { getLogs } from "../../tools/getLogs";
import { getFeeHistory } from "../../tools/getFeeHistory";
import { getGasEstimate } from "../../tools/getGasEstimate";
import { getGasPrice } from "../../tools/getGasPrice";
import { getTransactionCount } from "../../tools/getTransactionCount.js";

describe("tools module", () => {
  it("should export an array", () => {
    expect(Array.isArray(tools)).toBe(true);
  });

  it("should contain the correct tools", () => {
    expect(tools).toContain(getEthBalance);
    expect(tools).toContain(getTransactionCount);
    expect(tools).toContain(getAccounts);
    expect(tools).toContain(getBlobBaseFee);
    expect(tools).toContainEqual(getBlockNumber);
    expect(tools).toContainEqual(getGasEstimate);
    expect(tools).toContainEqual(getFeeHistory);
    expect(tools).toContainEqual(getGasPrice);
    expect(tools).toContainEqual(getBlockByHash);
    expect(tools).toContainEqual(getBlockByNumber);
    expect(tools).toContainEqual(getBlockReceipts);
    expect(tools).toContainEqual(getBlockTransactionCountByHash);
    expect(tools).toContainEqual(getBlockTransactionCountByNumber);
    expect(tools).toContainEqual(getCode);
    expect(tools).toContainEqual(getLogs);
  });

  it("should have the correct length", () => {
    expect(tools).toHaveLength(15);
  });

  it("should have tools with correct names", () => {
    const names = tools.map((tool) => tool.name);
    expect(names).toContain("eth_get_balance");
    expect(names).toContain("eth_get_transaction_count");
  });
});
