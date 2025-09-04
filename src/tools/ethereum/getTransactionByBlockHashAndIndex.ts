import { z } from "zod";
import { CallToolResult } from "@modelcontextprotocol/sdk/types";
import { INFURA_CHAIN_URLS } from "../../config/chains.js";
import { JsonRpcResponse } from "../../types/rpc.js";

export const getTransactionByBlockHashAndIndex = {
  name: "eth_get_transaction_by_block_hash_and_index",
  description:
    "Returns information about a transaction given block hash and transaction index position. Defaults to Ethereum mainnet if no chain is specified.",
  schema: {
    blockHash: z.string().describe("32-byte block hash"),
    index: z.string().describe("Hex transaction index position within the block"),
    chainid: z
      .number()
      .optional()
      .describe("EVM chain ID (default: 1 for Ethereum mainnet)"),
  },
  handler: async ({
    blockHash,
    index,
    chainid,
  }: {
    blockHash: string;
    index: string;
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
        method: "eth_getTransactionByBlockHashAndIndex",
        params: [blockHash, index],
        id: 1,
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data: JsonRpcResponse = await res.json();

      if (!("result" in data)) {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching transaction: ${data.error?.message || "Unknown error"}`,
            },
          ],
        };
      }

      if (data.result === null) {
        return {
          content: [
            {
              type: "text",
              text: `No transaction found at index ${index} in block ${blockHash} on chainid ${selectedChainId}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `Transaction for block ${blockHash} index ${index} on chainid ${selectedChainId}`,
          },
          { type: "text", text: JSON.stringify(data.result) },
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
          { type: "text", text: `Error fetching transaction: ${message}` },
        ],
      };
    }
  },
};


