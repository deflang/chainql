import { getAccounts } from "./ethereum/getAccounts.js";
import { getEthBalance } from "./ethereum/getBalance.js";
import { getTransactionCount } from "./ethereum/getTransactionCount.js";
import { getBlobBaseFee } from "./ethereum/getBlobBaseFee.js";
import { getBlockNumber } from "./ethereum/getBlockNumber.js";
import { getGasEstimate } from "./ethereum/getGasEstimate.js";
import { getFeeHistory } from "./ethereum/getFeeHistory.js";
import { getGasPrice } from "./ethereum/getGasPrice.js";
import { getBlockByHash } from "./ethereum/getBlockByHash.js";
import { getBlockByNumber } from "./ethereum/getBlockByNumber.js";
import { getBlockReceipts } from "./ethereum/getBlockReceipts.js";
import { getBlockTransactionCountByHash } from "./ethereum/getBlockTransactionCountByHash.js";
import { getBlockTransactionCountByNumber } from "./ethereum/getBlockTransactionCountByNumber.js";
import { getCode } from "./ethereum/getCode.js";
import { getLogs } from "./ethereum/getLogs.js";
import { getProof } from "./ethereum/getProof.js";
import { getStorageAt } from "./ethereum/getStorageAt.js";
import { getTransactionByBlockHashAndIndex } from "./ethereum/getTransactionByBlockHashAndIndex.js";
import { getTransactionByBlockNumberAndIndex } from "./ethereum/getTransactionByBlockNumberAndIndex.js";
import { getTransactionByHash } from "./ethereum/getTransactionByHash.js";
import { getTransactionReceipt } from "./ethereum/getTransactionReceipt.js";
import { getUncleByBlockHashAndIndex } from "./ethereum/getUncleByBlockHashAndIndex.js";
import { getUncleByBlockNumberAndIndex } from "./ethereum/getUncleByBlockNumberAndIndex.js";
import { getUncleCountByBlockHash } from "./ethereum/getUncleCountByBlockHash.js";
import { getUncleCountByBlockNumber } from "./ethereum/getUncleCountByBlockNumber.js";
import { getWork } from "./ethereum/getWork.js";
import { getHashrate } from "./ethereum/getHashRate.js";
import { getMaxPriorityFeePerGas } from "./ethereum/getMaxPriorityFeePerGas.js";
import { getMiningStatus } from "./ethereum/getMiningStatus.js";
import { getProtocolVersion } from "./ethereum/getProtocolVersion.js";
import { sendRawTransaction } from "./ethereum/sendRawTransaction.js";
import { WRITE_TOOLS_ENABLED } from "../config/chains.js";
import { getSimulatedTransactions } from "./ethereum/getSimulatedTransactions.js";
import { submitWork } from "./ethereum/submitWork.js";
import { getSyncStatus } from "./ethereum/getSyncStatus.js";
import { getClientVersion } from "./ethereum/getClientVersion.js";

const read_only_tools = [
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
  getMaxPriorityFeePerGas,
  getMiningStatus,
  getProtocolVersion,
  getSimulatedTransactions,
  getSyncStatus,
  getClientVersion,
];

export const tools = WRITE_TOOLS_ENABLED
  ? [...read_only_tools, sendRawTransaction, submitWork]
  : read_only_tools;
