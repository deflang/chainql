import { z } from "zod";
import { CallToolResult } from "@modelcontextprotocol/sdk/types";
import { INFURA_CHAIN_URLS } from "../../config/chains.js";
import { JsonRpcResponse } from "../../types/rpc.js";

export const getGasPrice = {
  name: "eth_get_gas_price",
  description:
    "Retrieve the current gas price in wei. Defaults to Ethereum mainnet if no chain is specified.",
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
        method: "eth_gasPrice",
        params: [],
        id: 1,
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data: JsonRpcResponse = await res.json();

      if (!data.result || typeof data.result !== "string") {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching gas price: ${
                data.error?.message || "Unknown error"
              }`,
            },
          ],
        };
      }

      const gasPriceHex = data.result;
      const gasPriceWei = parseInt(gasPriceHex, 16);

      return {
        content: [
          {
            type: "text",
            text: `Gas price (chainid ${selectedChainId}): ${gasPriceWei} wei (hex: ${gasPriceHex})`,
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
          {
            type: "text",
            text: `Error fetching gas price: ${message}`,
          },
        ],
      };
    }
  },
};
