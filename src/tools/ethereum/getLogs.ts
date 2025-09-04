import { z } from "zod";
import { CallToolResult } from "@modelcontextprotocol/sdk/types";
import { INFURA_CHAIN_URLS } from "../../config/chains.js";
import { JsonRpcResponse } from "../../types/rpc.js";

const AddressOrAddressesSchema = z.union([z.string(), z.array(z.string())]);

export const getLogs = {
  name: "eth_get_logs",
  description:
    "Returns an array of log objects matching the provided filter. Defaults to Ethereum mainnet if no chain is specified.",
  schema: {
    address: AddressOrAddressesSchema.optional().describe(
      "Single contract address or array of addresses"
    ),
    fromBlock: z
      .string()
      .optional()
      .describe(
        "Hex block number or tag (latest, earliest, pending, safe, finalized). Default: latest"
      ),
    toBlock: z
      .string()
      .optional()
      .describe(
        "Hex block number or tag (latest, earliest, pending, safe, finalized). Default: latest"
      ),
    topics: z.array(z.string()).optional().describe("Array of topic hashes"),
    blockHash: z
      .string()
      .optional()
      .describe(
        "If provided, restricts logs to this single block. Must not be combined with fromBlock/toBlock"
      ),
    chainid: z
      .number()
      .optional()
      .describe("EVM chain ID (default: 1 for Ethereum mainnet)"),
  },
  handler: async ({
    address,
    fromBlock,
    toBlock,
    topics,
    blockHash,
    chainid,
  }: {
    address?: string | string[];
    fromBlock?: string;
    toBlock?: string;
    topics?: string[];
    blockHash?: string;
    chainid?: number;
  }): Promise<CallToolResult> => {
    try {
      if (blockHash && (fromBlock || toBlock)) {
        return {
          content: [
            {
              type: "text",
              text:
                "Invalid filter: blockHash cannot be combined with fromBlock/toBlock",
            },
          ],
        };
      }

      const selectedChainId = chainid ?? 1;
      const url = INFURA_CHAIN_URLS[selectedChainId];

      if (!url) {
        return {
          content: [
            { type: "text", text: `Unsupported chain ID: ${selectedChainId}` },
          ],
        };
      }

      const filter: Record<string, unknown> = {};
      if (address) filter.address = address;
      if (blockHash) filter.blockHash = blockHash;
      if (!blockHash) {
        filter.fromBlock = fromBlock ?? "latest";
        filter.toBlock = toBlock ?? "latest";
      }
      if (topics) filter.topics = topics;

      const body = {
        jsonrpc: "2.0",
        method: "eth_getLogs",
        params: [filter],
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
              text: `Error fetching logs: ${data.error?.message || "Unknown error"}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `Fetched ${Array.isArray(data.result) ? data.result.length : 0} logs on chainid ${selectedChainId}`,
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
        content: [{ type: "text", text: `Error fetching logs: ${message}` }],
      };
    }
  },
};


