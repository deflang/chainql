import { getAccounts } from "./getAccounts.js";
import { getEthBalance } from "./getBalance.js";
import { getTransactionCount } from "./getTransactionCount.js";

export const tools = [getEthBalance, getTransactionCount, getAccounts];
