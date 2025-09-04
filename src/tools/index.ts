import { getAccounts } from "./getAccounts.js";
import { getEthBalance } from "./getBalance.js";
import { getTransactionCount } from "./getTransactionCount.js";
import { getBlobBaseFee } from "./getBlobBaseFee.js";
import { getBlockNumber } from "./getBlockNumber.js";
import { getGasEstimate } from "./getGasEstimate.js";
import { getFeeHistory } from "./getFeeHistory.js";
import { getGasPrice } from "./getGasPrice.js";
import { getBlockByHash } from "./getBlockByHash.js";
import { getBlockByNumber } from "./getBlockByNumber.js";
import { getBlockReceipts } from "./getBlockReceipts.js";
import { getBlockTransactionCountByHash } from "./getBlockTransactionCountByHash.js";
import { getBlockTransactionCountByNumber } from "./getBlockTransactionCountByNumber.js";
import { getCode } from "./getCode.js";
import { getLogs } from "./getLogs.js";
import { getProof } from "./getProof.js";
import { getStorageAt } from "./getStorageAt.js";
import { getTransactionByBlockHashAndIndex } from "./getTransactionByBlockHashAndIndex.js";

export const tools = [
  getEthBalance,
  getTransactionCount,
  getAccounts,
  getBlobBaseFee,
  getBlockNumber,
  getGasEstimate,
  getFeeHistory,
  getGasPrice,
  getBlockByHash,
  getBlockByNumber,
  getBlockReceipts,
  getBlockTransactionCountByHash,
  getBlockTransactionCountByNumber,
  getCode,
  getLogs,
  getProof,
  getStorageAt,
  getTransactionByBlockHashAndIndex
];
