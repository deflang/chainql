import { z } from "zod";
import { CallToolResult } from "@modelcontextprotocol/sdk/types";
import { INFURA_CHAIN_URLS } from "../../config/chains.js";
import { JsonRpcResponse } from "../../types/rpc.js";

export const getBlockNumber = {
  name: "eth_get_block_number",
  description:
    "Returns the latest block number on a specified EVM chain, defaulting to Ethereum mainnet.",
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
            {
              type: "text",
              text: `Unsupported or missing URL for chain ID ${selectedChainId}`,
            },
          ],
        };
      }

      const body = {
        jsonrpc: "2.0",
        method: "eth_blockNumber",
        params: [],
        id: 1,
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data: JsonRpcResponse = (await res.json()) as JsonRpcResponse;

      if (!data.result) {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching block number: ${
                data.error?.message ?? "Unknown error"
              }`,
            },
          ],
        };
      }

      const blockNumber = parseInt(data.result, 16);

      return {
        content: [
          {
            type: "text",
            text: `Latest block number on chain ${selectedChainId}: ${blockNumber} (hex: ${data.result})`,
          },
        ],
      };
    } catch (err) {
      return {
        content: [
          {
            type: "text",
            text: `Error fetching block number: ${
              err instanceof Error ? err.message : String(err)
            }`,
          },
        ],
      };
    }
  },
};
