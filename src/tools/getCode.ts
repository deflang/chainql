import { z } from "zod";
import { CallToolResult } from "@modelcontextprotocol/sdk/types";
import { INFURA_CHAIN_URLS } from "../config/chains.js";
import { JsonRpcResponse } from "../types/rpc.js";

export const getCode = {
  name: "eth_get_code",
  description:
    "Returns the compiled byte code of a smart contract at a given address. Defaults to Ethereum mainnet if no chain is specified.",
  schema: {
    address: z.string().describe("Contract address (20 bytes)"),
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
    block,
    chainid,
  }: {
    address: string;
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
        method: "eth_getCode",
        params: [address, block],
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
              text: `Error fetching contract code: ${
                data.error?.message || "Unknown error"
              }`,
            },
          ],
        };
      }

      const bytecode: string = data.result;
      const byteLength = (bytecode.startsWith("0x")
        ? (bytecode.length - 2)
        : bytecode.length) / 2;

      return {
        content: [
          {
            type: "text",
            text: `Bytecode for ${address} at ${block} on chainid ${selectedChainId}: length ${byteLength} bytes`,
          },
          { type: "text", text: bytecode },
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
          { type: "text", text: `Error fetching contract code: ${message}` },
        ],
      };
    }
  },
};


