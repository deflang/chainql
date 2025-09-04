import { z } from "zod";
import { CallToolResult } from "@modelcontextprotocol/sdk/types";
import { INFURA_CHAIN_URLS } from "../config/chains.js";
import { JsonRpcResponse } from "../types/rpc.js";

export const getTransactionByHash = {
  name: "eth_get_transaction_by_hash",
  description:
    "Returns information about a transaction for a given hash. Defaults to Ethereum mainnet if no chain is specified.",
  schema: {
    hash: z.string().describe("32-byte transaction hash"),
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
        method: "eth_getTransactionByHash",
        params: [hash],
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
              text: `No transaction found for hash ${hash} on chainid ${selectedChainId}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `Transaction for hash ${hash} on chainid ${selectedChainId}`,
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


