import { tools } from "../../tools";

import { getAccounts } from "../../tools/getAccounts";
import { getEthBalance } from "../../tools/getBalance.js";
import { getTransactionCount } from "../../tools/getTransactionCount.js";
import { getBlobBaseFee } from "../../tools/getBlobBaseFee";
import { getBlockNumber } from "../../tools/getBlockNumber";
import { getGasEstimate } from "../../tools/getGasEstimate";
import { getFeeHistory } from "../../tools/getFeeHistory";
import { getGasPrice } from "../../tools/getGasPrice";
import { getBlockByHash } from "../../tools/getBlockByHash";
import { getBlockByNumber } from "../../tools/getBlockByNumber";
import { getBlockReceipts } from "../../tools/getBlockReceipts";
import { getBlockTransactionCountByHash } from "../../tools/getBlockTransactionCountByHash";
import { getBlockTransactionCountByNumber } from "../../tools/getBlockTransactionCountByNumber";
import { getCode } from "../../tools/getCode";
import { getLogs } from "../../tools/getLogs";
import { getProof } from "../../tools/getProof";
import { getStorageAt } from "../../tools/getStorageAt";
import { getTransactionByBlockHashAndIndex } from "../../tools/getTransactionByBlockHashAndIndex";
import { getTransactionByBlockNumberAndIndex } from "../../tools/getTransactionByBlockNumberAndIndex";
import { getTransactionByHash } from "../../tools/getTransactionByHash";
import { getTransactionReceipt } from "../../tools/getTransactionReceipt";
import { getUncleByBlockHashAndIndex } from "../../tools/getUncleByBlockHashAndIndex";
import { getUncleByBlockNumberAndIndex } from "../../tools/getUncleByBlockNumberAndIndex";
import { getUncleCountByBlockHash } from "../../tools/getUncleCountByBlockHash";
import { getUncleCountByBlockNumber } from "../../tools/getUncleCountByBlockNumber";
import { getWork } from "../../tools/getWork";
import { getHashrate } from "../../tools/getHashRate";
import { getMaxPriorityFeePerGas } from "../../tools/getMaxPriorityFeePerGas";
import { getMiningStatus } from "../../tools/getMiningStatus";
import { getProtocolVersion } from "../../tools/getProtocolVersion";
import { sendRawTransaction } from "../../tools/sendRawTransaction";
import { getSimulatedTransactions } from "../../tools/getSimulatedTransactions";

describe("tools module", () => {
  it("should export an array", () => {
    expect(Array.isArray(tools)).toBe(true);
  });

  it("should contain the expected read-only tools", () => {
    expect(tools).toContain(getEthBalance);
    expect(tools).toContain(getTransactionCount);
    expect(tools).toContain(getAccounts);
    expect(tools).toContain(getBlobBaseFee);
    expect(tools).toContain(getBlockNumber);
    expect(tools).toContain(getGasEstimate);
    expect(tools).toContain(getFeeHistory);
    expect(tools).toContain(getGasPrice);
    expect(tools).toContain(getBlockByHash);
    expect(tools).toContain(getBlockByNumber);
    expect(tools).toContain(getBlockReceipts);
    expect(tools).toContain(getBlockTransactionCountByHash);
    expect(tools).toContain(getBlockTransactionCountByNumber);
    expect(tools).toContain(getCode);
    expect(tools).toContain(getLogs);
    expect(tools).toContain(getProof);
    expect(tools).toContain(getStorageAt);
    expect(tools).toContain(getTransactionByBlockHashAndIndex);
    expect(tools).toContain(getTransactionByBlockNumberAndIndex);
    expect(tools).toContain(getTransactionByHash);
    expect(tools).toContain(getTransactionReceipt);
    expect(tools).toContain(getUncleByBlockHashAndIndex);
    expect(tools).toContain(getUncleByBlockNumberAndIndex);
    expect(tools).toContain(getUncleCountByBlockHash);
    expect(tools).toContain(getUncleCountByBlockNumber);
    expect(tools).toContain(getWork);
    expect(tools).toContain(getHashrate);
    expect(tools).toContain(getMaxPriorityFeePerGas);
    expect(tools).toContain(getMiningStatus);
    expect(tools).toContain(getProtocolVersion);
    expect(tools).toContain(getSimulatedTransactions);
  });

  it("should have tools with correct names", () => {
    const names = tools.map((tool) => tool.name);
    expect(names).toContain("eth_get_balance");
    expect(names).toContain("eth_get_transaction_count");
    expect(names).toContain("eth_get_block_number");
  });

  it("should respect WRITE_TOOLS_ENABLED=false (default)", async () => {
    jest.resetModules();
    jest.doMock("../../config/chains", () => ({
      WRITE_TOOLS_ENABLED: false,
      INFURA_CHAIN_URLS: {},
    }));

    const { tools: readonlyTools } = await import("../../tools");
    expect(readonlyTools).not.toContain(sendRawTransaction);
  });

  it("should include sendRawTransaction when WRITE_TOOLS_ENABLED=true", async () => {
    jest.resetModules();
    jest.doMock("../../config/chains", () => ({
      WRITE_TOOLS_ENABLED: true,
      INFURA_CHAIN_URLS: {},
    }));

    const { tools: writableTools } = await import("../../tools");
    const names = writableTools.map((tool) => tool.name);
    expect(names).toContain("eth_send_raw_transaction");
  });
});
