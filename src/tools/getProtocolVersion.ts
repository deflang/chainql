import { z } from "zod";
import { CallToolResult } from "@modelcontextprotocol/sdk/types";
import { INFURA_CHAIN_URLS } from "../config/chains.js";
import { JsonRpcResponse } from "../types/rpc.js";

export const getProtocolVersion = {
  name: "eth_get_protocol_version",
  description: "Returns the current Ethereum protocol version (hexadecimal).",
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
        method: "eth_protocolVersion",
        params: [],
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
              text: `Error fetching protocol version: ${
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
            text: `Protocol version on chainid ${selectedChainId}: ${data.result}`,
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
          { type: "text", text: `Error fetching protocol version: ${message}` },
        ],
      };
    }
  },
};
