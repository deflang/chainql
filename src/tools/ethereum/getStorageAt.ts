import { z } from "zod";
import { CallToolResult } from "@modelcontextprotocol/sdk/types";
import { INFURA_CHAIN_URLS } from "../../config/chains.js";
import { JsonRpcResponse } from "../../types/rpc.js";

export const getStorageAt = {
  name: "eth_get_storage_at",
  description:
    "Returns the value from a storage position at a given address. Defaults to Ethereum mainnet if no chain is specified.",
  schema: {
    address: z.string().describe("Contract address (20 bytes)"),
    position: z
      .string()
      .describe(
        "Hexadecimal storage position (e.g. 0x0 or keccak slot hash for mappings)"
      ),
    block: z
      .string()
      .describe(
        "Hex block number (e.g. 0x65a8db) or tag (latest, earliest, pending, safe, finalized)"
      ),
    chainid: z
      .number()
      .optional()
      .describe("EVM chain ID (default: 1 for Ethereum mainnet)"),
  },
  handler: async ({
    address,
    position,
    block,
    chainid,
  }: {
    address: string;
    position: string;
    block: string;
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
        method: "eth_getStorageAt",
        params: [address, position, block],
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
              text: `Error fetching storage: ${data.error?.message || "Unknown error"}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `Storage at ${position} for ${address} at ${block} on chainid ${selectedChainId}: ${data.result}`,
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
          { type: "text", text: `Error fetching storage: ${message}` },
        ],
      };
    }
  },
};


