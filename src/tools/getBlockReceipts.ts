import { z } from "zod";
import { CallToolResult } from "@modelcontextprotocol/sdk/types";
import { INFURA_CHAIN_URLS } from "../config/chains.js";
import { JsonRpcResponse } from "../types/rpc.js";

export const getBlockReceipts = {
  name: "eth_get_block_receipts",
  description:
    "Retrieve all transaction receipts for a given block, including gas used and event logs. Defaults to Ethereum mainnet if no chain is specified. Uses 1000 credits.",
  schema: {
    blockNumber: z
      .string()
      .describe(
        "Hexadecimal block number (e.g., 0x5BAD55) or tag: latest, earliest, pending, safe, finalized"
      ),
    chainid: z
      .number()
      .optional()
      .describe("EVM chain ID (default: 1 for Ethereum mainnet)"),
  },
  handler: async ({
    blockNumber,
    chainid,
  }: {
    blockNumber: string;
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
        method: "eth_getBlockReceipts",
        params: [blockNumber],
        id: 1,
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data: JsonRpcResponse = await res.json();

      if (!data.result || !Array.isArray(data.result)) {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching block receipts: ${
                data.error?.message || "Unknown error"
              }`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `Block receipts (chainid ${selectedChainId}): ${JSON.stringify(
              data.result,
              null,
              2
            )}`,
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
          { type: "text", text: `Error fetching block receipts: ${message}` },
        ],
      };
    }
  },
};
