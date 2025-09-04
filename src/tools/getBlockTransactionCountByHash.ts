import { z } from "zod";
import { CallToolResult } from "@modelcontextprotocol/sdk/types";
import { INFURA_CHAIN_URLS } from "../config/chains.js";
import { JsonRpcResponse } from "../types/rpc.js";

export const getBlockTransactionCountByHash = {
  name: "eth_get_block_transaction_count_by_hash",
  description:
    "Returns the number of transactions in the block with the given block hash. Defaults to Ethereum mainnet if no chain is specified.",
  schema: {
    hash: z.string().describe("32-byte block hash"),
    chainid: z
      .number()
      .optional()
      .describe("EVM chain ID (default: 1 for Ethereum mainnet)"),
  },
  handler: async ({
    hash,
    chainid,
  }: {
    hash: string;
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

      const body = {
        jsonrpc: "2.0",
        method: "eth_getBlockTransactionCountByHash",
        params: [hash],
        id: 1,
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data: JsonRpcResponse = await res.json();

      if (!data.result) {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching block transaction count: ${
                data.error?.message || "Unknown error"
              }`,
            },
          ],
        };
      }

      // Result is a hex string like "0x50"
      const txCount = parseInt(data.result, 16);

      return {
        content: [
          {
            type: "text",
            text: `Transaction count for block ${hash} on chainid ${selectedChainId}: ${txCount} (hex: ${data.result})`,
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
            text: `Error fetching block transaction count: ${message}`,
          },
        ],
      };
    }
  },
};


