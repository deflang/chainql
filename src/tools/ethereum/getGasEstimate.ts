import { z } from "zod";
import { CallToolResult } from "@modelcontextprotocol/sdk/types";
import { INFURA_CHAIN_URLS } from "../../config/chains.js";
import { JsonRpcResponse } from "../../types/rpc.js";

export const getGasEstimate = {
  name: "eth_get_gas_estimate",
  description:
    "Retrieve an estimate of how much gas is necessary for a transaction to complete. The transaction will not be added to the blockchain. Defaults to Ethereum mainnet if no chain is specified.",
  schema: {
    from: z.string().optional().describe("Sender address (optional)"),
    to: z.string().optional().describe("Recipient address (optional)"),
    value: z
      .string()
      .optional()
      .describe("Hex value of ETH to send (optional)"),
    data: z
      .string()
      .optional()
      .describe("Encoded contract method call data (optional)"),
    gas: z
      .string()
      .optional()
      .describe("Gas limit provided for execution (optional)"),
    gasPrice: z
      .string()
      .optional()
      .describe("Gas price per unit in wei (optional)"),
    maxPriorityFeePerGas: z
      .string()
      .optional()
      .describe("EIP-1559 max priority fee per gas (optional)"),
    maxFeePerGas: z
      .string()
      .optional()
      .describe("EIP-1559 max total fee per gas (optional)"),
    block: z
      .string()
      .optional()
      .describe(
        "Hexadecimal block number or tag (latest, earliest, pending, safe, finalized). Default: latest"
      ),
    chainid: z
      .number()
      .optional()
      .describe("EVM chain ID (default: 1 for Ethereum mainnet)"),
  },
  handler: async ({
    from,
    to,
    value,
    data,
    gas,
    gasPrice,
    maxPriorityFeePerGas,
    maxFeePerGas,
    block,
    chainid,
  }: {
    from?: string;
    to?: string;
    value?: string;
    data?: string;
    gas?: string;
    gasPrice?: string;
    maxPriorityFeePerGas?: string;
    maxFeePerGas?: string;
    block?: string;
    chainid?: number;
  }): Promise<CallToolResult> => {
    try {
      const selectedChainId = chainid ?? 1;
      const url = INFURA_CHAIN_URLS[selectedChainId];

      if (!url) {
        return {
          content: [
            { type: "text", text: `Unsupported chain ID: ${selectedChainId}` },
          ],
        };
      }

      // Build the transaction call object
      const tx: Record<string, string> = {};
      if (from) tx.from = from;
      if (to) tx.to = to;
      if (value) tx.value = value;
      if (data) tx.data = data;
      if (gas) tx.gas = gas;
      if (gasPrice) tx.gasPrice = gasPrice;
      if (maxPriorityFeePerGas) tx.maxPriorityFeePerGas = maxPriorityFeePerGas;
      if (maxFeePerGas) tx.maxFeePerGas = maxFeePerGas;

      const body = {
        jsonrpc: "2.0",
        method: "eth_estimateGas",
        params: [tx, block ?? "latest"],
        id: 1,
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const dataRes: JsonRpcResponse = await res.json();

      if (!dataRes.result) {
        return {
          content: [
            {
              type: "text",
              text: `Error estimating gas: ${
                dataRes.error?.message || "Unknown error"
              }`,
            },
          ],
        };
      }

      // Convert hex to decimal for readability
      const gasEstimate = parseInt(dataRes.result, 16);

      return {
        content: [
          {
            type: "text",
            text: `Estimated gas: ${gasEstimate} (hex: ${dataRes.result})`,
          },
        ],
      };
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
          ? err
          : JSON.stringify(err);

      return {
        content: [
          {
            type: "text",
            text: `Error estimating gas: ${message}`,
          },
        ],
      };
    }
  },
};
