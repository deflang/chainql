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
import { getTransactionByBlockNumberAndIndex } from "./getTransactionByBlockNumberAndIndex.js";
import { getTransactionByHash } from "./getTransactionByHash.js";
import { getTransactionReceipt } from "./getTransactionReceipt.js";
import { getUncleByBlockHashAndIndex } from "./getUncleByBlockHashAndIndex.js";
import { getUncleByBlockNumberAndIndex } from "./getUncleByBlockNumberAndIndex.js";
import { getUncleCountByBlockHash } from "./getUncleCountByBlockHash.js";
import { getUncleCountByBlockNumber } from "./getUncleCountByBlockNumber.js";
import { getWork } from "./getWork.js";
import { getHashrate } from "./getHashRate.js";
import { getMaxPriorityFeePerGas } from "./getMaxPriorityFeePerGas.js";

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
  getTransactionByBlockHashAndIndex,
  getTransactionByBlockNumberAndIndex,
  getTransactionByHash,
  getTransactionReceipt,
  getUncleByBlockHashAndIndex,
  getUncleByBlockNumberAndIndex,
  getUncleCountByBlockHash,
  getUncleCountByBlockNumber,
  getWork,
  getHashrate,
  getMaxPriorityFeePerGas
];
