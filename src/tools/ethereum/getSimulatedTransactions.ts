import { z } from "zod";
import { CallToolResult } from "@modelcontextprotocol/sdk/types";
import { INFURA_CHAIN_URLS } from "../../config/chains.js";
import { JsonRpcResponse } from "../../types/rpc.js";

const MAX_BLOCK_STATE_CALLS = 16;

export const getSimulatedTransactions = {
  name: "eth_get_simulated_transactions",
  description:
    "Simulates transactions across multiple blocks with optional block and state overrides. Only supported on Mainnet (1) and Sepolia (11155111).",
  schema: {
    blockStateCalls: z
      .array(
        z.object({
          calls: z
            .array(
              z.object({
                to: z.string().describe("Contract address to call"),
                data: z
                  .string()
                  .optional()
                  .describe("Encoded function call data"),
                value: z
                  .string()
                  .optional()
                  .describe("ETH value to send (in wei as hex)"),
                gas: z.string().optional().describe("Gas limit for this call"),
                gasPrice: z
                  .string()
                  .optional()
                  .describe("Gas price for this call"),
              })
            )
            .describe("Array of calls to simulate"),
          blockOverride: z
            .object({
              number: z.string().optional().describe("Block number override"),
              difficulty: z
                .string()
                .optional()
                .describe("Block difficulty override"),
              time: z.string().optional().describe("Block timestamp override"),
              gasLimit: z
                .string()
                .optional()
                .describe("Block gas limit override"),
              coinbase: z
                .string()
                .optional()
                .describe("Block coinbase override"),
              random: z
                .string()
                .optional()
                .describe("Block random value override"),
              baseFee: z
                .string()
                .optional()
                .describe("Block base fee override"),
            })
            .optional()
            .describe("Optional block parameter overrides"),
          stateOverride: z
            .record(
              z.object({
                balance: z
                  .string()
                  .optional()
                  .describe("Account balance override"),
                nonce: z.string().optional().describe("Account nonce override"),
                code: z.string().optional().describe("Account code override"),
                state: z
                  .record(z.string())
                  .optional()
                  .describe("Storage slot overrides"),
                stateDiff: z
                  .record(z.string())
                  .optional()
                  .describe("Storage slot diffs"),
              })
            )
            .optional()
            .describe("Optional state overrides by address"),
        })
      )
      .describe("Array of block state call objects (max 16)"),
    validation: z
      .boolean()
      .optional()
      .describe(
        "If true, run EVM validations except sender/signature checks (default: false)"
      ),
    traceTransfers: z
      .boolean()
      .optional()
      .describe(
        "If true, add ETH transfers as ERC-20 transfer-like logs (default: false)"
      ),
    returnFullTransactionObjects: z
      .boolean()
      .optional()
      .describe(
        "If true, returns full tx objects instead of hashes (default: false)"
      ),
    blockParameter: z
      .string()
      .optional()
      .describe(
        "A hexadecimal block number, or tag: latest | earliest | pending | finalized"
      ),
    chainid: z
      .number()
      .optional()
      .describe("EVM chain ID (default: 1 for Ethereum mainnet)"),
  },
  handler: async ({
    chainid,
    blockStateCalls,
    validation,
    traceTransfers,
    returnFullTransactionObjects,
    blockParameter,
  }: {
    chainid?: number;
    blockStateCalls: Array<{
      calls: Array<{
        to: string;
        data?: string;
        value?: string;
        gas?: string;
        gasPrice?: string;
      }>;
      blockOverride?: {
        number?: string;
        difficulty?: string;
        time?: string;
        gasLimit?: string;
        coinbase?: string;
        random?: string;
        baseFee?: string;
      };
      stateOverride?: Record<
        string,
        {
          balance?: string;
          nonce?: string;
          code?: string;
          state?: Record<string, string>;
          stateDiff?: Record<string, string>;
        }
      >;
    }>;
    validation?: boolean;
    traceTransfers?: boolean;
    returnFullTransactionObjects?: boolean;
    blockParameter?: string;
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

      if (!Array.isArray(blockStateCalls)) {
        return {
          content: [
            {
              type: "text",
              text: "Invalid params: blockStateCalls must be an array",
            },
          ],
        };
      }

      if (blockStateCalls.length > MAX_BLOCK_STATE_CALLS) {
        return {
          content: [
            {
              type: "text",
              text: `Too many blockStateCalls: maximum is ${MAX_BLOCK_STATE_CALLS}`,
            },
          ],
        };
      }

      const requestObj: Record<string, unknown> = { blockStateCalls };
      if (validation !== undefined) requestObj.validation = validation;
      if (traceTransfers !== undefined)
        requestObj.traceTransfers = traceTransfers;
      if (returnFullTransactionObjects !== undefined) {
        requestObj.returnFullTransactionObjects = returnFullTransactionObjects;
      }

      const params: unknown[] = [requestObj];
      if (blockParameter) params.push(blockParameter);

      const body = {
        jsonrpc: "2.0",
        method: "eth_simulateV1",
        params,
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
              text: `Error simulating: ${
                data.error?.message || "Unknown error"
              }`,
            },
          ],
        };
      }

      const count = Array.isArray(data.result) ? data.result.length : 0;
      const where = blockParameter ?? "(default block)";

      return {
        content: [
          {
            type: "text",
            text: `Simulated ${count} blockStateCall(s) on chainid ${selectedChainId} at ${where}`,
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
        content: [{ type: "text", text: `Error simulating: ${message}` }],
      };
    }
  },
};
