import { z } from "zod";
import { CallToolResult } from "@modelcontextprotocol/sdk/types";
import { INFURA_CHAIN_URLS } from "../config/chains.js";
import { JsonRpcResponse } from "../types/rpc.js";

export const getBlobBaseFee = {
  name: "eth_get_blob_base_fee",
  description:
    "Returns the expected base fee for blobs in the next block on a specified EVM chain, defaulting to mainnet.",
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
        method: "eth_blobBaseFee",
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
              text: `Error fetching blob base fee: ${
                data.error?.message ?? "Unknown error"
              }`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `Blob base fee: ${JSON.stringify(data.result)}`,
          },
        ],
      };
    } catch (err) {
      return {
        content: [
          {
            type: "text",
            text: `Error fetching blob base fee: ${
              err instanceof Error ? err.message : String(err)
            }`,
          },
        ],
      };
    }
  },
};
