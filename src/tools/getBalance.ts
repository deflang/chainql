import { z } from "zod";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { INFURA_CHAIN_URLS } from "../config/chains.js";
import { JsonRpcResponse } from "../types/rpc.js";

export const getEthBalance = {
  name: "eth_get_balance",
  description:
    "Retrieve balance of an Ethereum address on a specified EVM chain, defaulting to mainnet.",
  schema: {
    address: z.string().describe("Ethereum address to query"),
    block: z
      .string()
      .optional()
      .describe(
        "Hexadecimal block number or string tag (latest, earliest, pending, safe, finalized). Default: latest"
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
    block?: string;
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
        method: "eth_getBalance",
        params: [address, block ?? "latest"],
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
              text: `Error fetching balance: ${
                data.error?.message || "Unknown error"
              }`,
            },
          ],
        };
      }

      const balanceEth = (parseInt(data.result, 16) / 1e18).toString();

      return {
        content: [
          {
            type: "text",
            text: `Balance of ${address} on chainid ${selectedChainId}: ${balanceEth} ETH`,
          },
        ],
      };
    } catch (err: unknown) {
      return {
        content: [
          {
            type: "text",
            text: `Error fetching balance: ${JSON.stringify(err)}`,
          },
        ],
      };
    }
  },
};
