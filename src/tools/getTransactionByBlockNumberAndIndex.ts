import { z } from "zod";
import { CallToolResult } from "@modelcontextprotocol/sdk/types";
import { INFURA_CHAIN_URLS } from "../config/chains.js";
import { JsonRpcResponse } from "../types/rpc.js";

export const getTransactionByBlockNumberAndIndex = {
  name: "eth_get_transaction_by_block_number_and_index",
  description:
    "Returns information about a transaction given block number (or tag) and transaction index position. Defaults to Ethereum mainnet if no chain is specified.",
  schema: {
    blockNumberOrTag: z
      .string()
      .describe(
        "Hex block number (e.g. 0x5BAD55) or tag (latest, earliest, pending, safe, finalized)"
      ),
    index: z.string().describe("Hex transaction index position within the block"),
    chainid: z
      .number()
      .optional()
      .describe("EVM chain ID (default: 1 for Ethereum mainnet)"),
  },
  handler: async ({
    blockNumberOrTag,
    index,
    chainid,
  }: {
    blockNumberOrTag: string;
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
        method: "eth_getTransactionByBlockNumberAndIndex",
        params: [blockNumberOrTag, index],
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
              text: `No transaction found at index ${index} in block ${blockNumberOrTag} on chainid ${selectedChainId}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `Transaction for block ${blockNumberOrTag} index ${index} on chainid ${selectedChainId}`,
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


