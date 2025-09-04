import { z } from "zod";
import { CallToolResult } from "@modelcontextprotocol/sdk/types";
import { INFURA_CHAIN_URLS } from "../../config/chains.js";
import { JsonRpcResponse } from "../../types/rpc.js";

export const getProof = {
  name: "eth_get_proof",
  description:
    "Returns account and storage values, including the Merkle proof, for a specified account.",
  schema: {
    address: z.string().describe("Account address (20 bytes)"),
    storageKeys: z.array(z.string()).describe("Array of 32-byte storage keys"),
    block: z
      .string()
      .describe(
        "Hex block number or tag (latest, earliest, pending, safe, finalized)"
      ),
    chainid: z
      .number()
      .optional()
      .describe("EVM chain ID (default: 1 for Ethereum mainnet)"),
  },
  handler: async ({
    address,
    storageKeys,
    block,
    chainid,
  }: {
    address: string;
    storageKeys: string[];
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
        method: "eth_getProof",
        params: [address, storageKeys, block],
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
              text: `Error fetching proof: ${data.error?.message || "Unknown error"}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `Fetched proof for ${address} at ${block} on chainid ${selectedChainId}`,
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
        content: [{ type: "text", text: `Error fetching proof: ${message}` }],
      };
    }
  },
};


