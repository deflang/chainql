import { z } from "zod";
import { CallToolResult } from "@modelcontextprotocol/sdk/types";
import { INFURA_CHAIN_URLS } from "../config/chains.js";
import { JsonRpcResponse } from "../types/rpc.js";

export const getUncleByBlockHashAndIndex = {
  name: "eth_get_uncle_by_block_hash_and_index",
  description:
    "Returns information about an uncle of a block given the block hash and the uncle index position. Defaults to Ethereum mainnet if no chain is specified.",
  schema: {
    blockHash: z.string().describe("32-byte block hash"),
    index: z.string().describe("Hex uncle index position within the block"),
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
        method: "eth_getUncleByBlockHashAndIndex",
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
              text: `Error fetching uncle: ${data.error?.message || "Unknown error"}`,
            },
          ],
        };
      }

      if (data.result === null) {
        return {
          content: [
            {
              type: "text",
              text: `No uncle found at index ${index} for block ${blockHash} on chainid ${selectedChainId}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `Uncle for block ${blockHash} index ${index} on chainid ${selectedChainId}`,
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
        content: [{ type: "text", text: `Error fetching uncle: ${message}` }],
      };
    }
  },
};


