import { z } from "zod";
import { CallToolResult } from "@modelcontextprotocol/sdk/types";
import { INFURA_CHAIN_URLS } from "../../config/chains.js";
import { JsonRpcResponse } from "../../types/rpc.js";

export const getFeeHistory = {
  name: "eth_get_fee_history",
  description:
    "Retrieve historical gas fee information (base fee, gas usage, priority fee rewards, blob gas usage). Defaults to Ethereum mainnet if no chain is specified.",
  schema: {
    blockCount: z
      .number()
      .min(1)
      .max(1024)
      .describe("Number of blocks in the requested range (1-1024)"),
    newestBlock: z
      .string()
      .optional()
      .describe(
        'Highest block of the requested range (hex string or tag: "latest", "earliest", "pending"). Default: "latest".'
      ),
    percentiles: z
      .array(z.number())
      .optional()
      .describe(
        "Monotonically increasing list of percentile values (e.g., [10, 50, 90])"
      ),
    chainid: z
      .number()
      .optional()
      .describe("EVM chain ID (default: 1 for Ethereum mainnet)"),
  },
  handler: async ({
    blockCount,
    newestBlock,
    percentiles,
    chainid,
  }: {
    blockCount: number;
    newestBlock?: string;
    percentiles?: number[];
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
              text: `Unsupported chain ID: ${selectedChainId}`,
            },
          ],
        };
      }

      const body = {
        jsonrpc: "2.0",
        method: "eth_feeHistory",
        params: [
          "0x" + blockCount.toString(16),
          newestBlock ?? "latest",
          percentiles ?? [],
        ],
        id: 1,
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data: JsonRpcResponse = await res.json();

      if (!data.result || typeof data.result !== "object") {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching fee history: ${
                data.error?.message || "Unknown error"
              }`,
            },
          ],
        };
      }

      const { oldestBlock, baseFeePerGas, gasUsedRatio } = data.result as {
        oldestBlock: string;
        baseFeePerGas: string[];
        gasUsedRatio: number[];
        baseFeePerBlobGas?: string[];
        blobGasUsedRatio?: number[];
        reward?: string[][];
      };

      return {
        content: [
          {
            type: "text",
            text: `Fee history (chainid ${selectedChainId}):\n- Oldest block: ${parseInt(
              oldestBlock,
              16
            )} (hex: ${oldestBlock})\n- Base fees: ${baseFeePerGas
              .slice(0, 5)
              .map((f: string) => parseInt(f, 16))
              .join(", ")}...\n- Gas used ratios: ${gasUsedRatio
              .slice(0, 5)
              .join(", ")}...`,
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
            text: `Error fetching fee history: ${message}`,
          },
        ],
      };
    }
  },
};
