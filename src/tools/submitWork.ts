import { z } from "zod";
import { CallToolResult } from "@modelcontextprotocol/sdk/types";
import { INFURA_CHAIN_URLS } from "../config/chains.js";
import { JsonRpcResponse } from "../types/rpc.js";

export const submitWork = {
  name: "eth_submit_work",
  description:
    "Submit a proof-of-work solution. Returns true if the solution is valid, false otherwise.",
  schema: {
    nonce: z.string().describe("The nonce found (8 bytes, hex string)"),
    powHash: z
      .string()
      .describe("The header's PoW-hash (32 bytes, hex string)"),
    mixDigest: z.string().describe("The mix digest (32 bytes, hex string)"),
    chainid: z
      .number()
      .optional()
      .describe("EVM chain ID (default: 1 for Ethereum mainnet)"),
  },
  handler: async ({
    nonce,
    powHash,
    mixDigest,
    chainid,
  }: {
    nonce: string;
    powHash: string;
    mixDigest: string;
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
        method: "eth_submitWork",
        params: [nonce, powHash, mixDigest],
        id: 1,
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data: JsonRpcResponse = await res.json();

      if (typeof data.result !== "boolean") {
        return {
          content: [
            {
              type: "text",
              text: `Error submitting work: ${
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
            text: `Work submission valid: ${data.result}`,
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
        content: [{ type: "text", text: `Error submitting work: ${message}` }],
      };
    }
  },
};
