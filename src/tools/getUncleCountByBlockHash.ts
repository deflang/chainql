import { z } from "zod";
import { CallToolResult } from "@modelcontextprotocol/sdk/types";
import { INFURA_CHAIN_URLS } from "../config/chains.js";
import { JsonRpcResponse } from "../types/rpc.js";

export const getUncleCountByBlockHash = {
  name: "eth_get_uncle_count_by_block_hash",
  description:
    "Returns the number of uncles in a block matching the given block hash. Defaults to Ethereum mainnet if no chain is specified.",
  schema: {
    blockHash: z.string().describe("32-byte block hash"),
    chainid: z
      .number()
      .optional()
      .describe("EVM chain ID (default: 1 for Ethereum mainnet)"),
  },
  handler: async ({
    blockHash,
    chainid,
  }: {
    blockHash: string;
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
        method: "eth_getUncleCountByBlockHash",
        params: [blockHash],
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
              text: `Error fetching uncle count: ${data.error?.message || "Unknown error"}`,
            },
          ],
        };
      }

      const count = parseInt(data.result, 16);

      return {
        content: [
          {
            type: "text",
            text: `Uncle count for block ${blockHash} on chainid ${selectedChainId}: ${count} (hex: ${data.result})`,
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
        content: [{ type: "text", text: `Error fetching uncle count: ${message}` }],
      };
    }
  },
};


