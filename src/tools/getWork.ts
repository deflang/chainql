import { z } from "zod";
import { CallToolResult } from "@modelcontextprotocol/sdk/types";
import { INFURA_CHAIN_URLS } from "../config/chains.js";
import { JsonRpcResponse } from "../types/rpc.js";

export const getWork = {
  name: "eth_get_work",
  description:
    "Returns the hash of the current block, the seed hash, and the boundary condition (target)",
  schema: {
    chainid: z
      .number()
      .optional()
      .describe("EVM chain ID (default: 1 for Ethereum mainnet)"),
  },
  handler: async ({
    chainid,
  }: {
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
        method: "eth_getWork",
        params: [],
        id: 1,
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data: JsonRpcResponse = await res.json();

      if (data.error) {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching work: ${data.error.message}`,
            },
          ],
        };
      }

      if (!data.result || !Array.isArray(data.result)) {
        return {
          content: [
            {
              type: "text",
              text: "Error fetching work: Unknown error",
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `Current mining work: ${JSON.stringify(
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
        content: [{ type: "text", text: `Error fetching work: ${message}` }],
      };
    }
  },
};
