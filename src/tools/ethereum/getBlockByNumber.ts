import { z } from "zod";
import { CallToolResult } from "@modelcontextprotocol/sdk/types";
import { INFURA_CHAIN_URLS } from "../../config/chains.js";
import { JsonRpcResponse } from "../../types/rpc.js";

export const getBlockByNumber = {
  name: "eth_get_block_by_number",
  description:
    "Retrieve block details by its number or tag (latest, earliest, pending, safe, finalized). Defaults to Ethereum mainnet if no chain is specified.",
  schema: {
    block: z
      .string()
      .describe(
        "Hexadecimal block number (e.g., 0x5BAD55) or tag: latest, earliest, pending, safe, finalized"
      ),
    includeTxs: z
      .boolean()
      .describe(
        "If true, return full transaction objects; if false, return only transaction hashes"
      ),
    chainid: z
      .number()
      .optional()
      .describe("EVM chain ID (default: 1 for Ethereum mainnet)"),
  },
  handler: async ({
    block,
    includeTxs,
    chainid,
  }: {
    block: string;
    includeTxs: boolean;
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
        method: "eth_getBlockByNumber",
        params: [block, includeTxs],
        id: 1,
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data: JsonRpcResponse = await res.json();

      if (!data.result || typeof data.result !== "object") {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching block: ${
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
            text: `Block info (chainid ${selectedChainId}): ${JSON.stringify(
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
        content: [{ type: "text", text: `Error fetching block: ${message}` }],
      };
    }
  },
};