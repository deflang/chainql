import { getAccounts } from "./getAccounts.js";
import { getEthBalance } from "./getBalance.js";
import { getTransactionCount } from "./getTransactionCount.js";
import { getBlobBaseFee } from "./getBlobBaseFee.js";
import { getBlockNumber } from "./getBlockNumber.js";
import { getGasEstimate } from "./getGasEstimate.js";
import { getFeeHistory } from "./getFeeHistory.js";

export const tools = [
  getEthBalance,
  getTransactionCount,
  getAccounts,
  getBlobBaseFee,
  getBlockNumber,
  getGasEstimate,
  getFeeHistory
];
