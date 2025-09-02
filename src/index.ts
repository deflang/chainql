import { z } from "zod";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { ExpressHttpStreamableMcpServer } from "./server.js";
import "dotenv/config";

const INFURA_API_KEY: string = process.env.INFURA_API_KEY || "";
if (!INFURA_API_KEY) throw new Error("INFURA_API_KEY is not set");

// Supported chain RPC mappings via Infura
const INFURA_CHAIN_URLS: Record<number, string> = {
  1: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`, // Ethereum Mainnet
  5: `https://goerli.infura.io/v3/${INFURA_API_KEY}`, // Goerli Testnet
  11155111: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`, // Sepolia Testnet
  137: `https://polygon-mainnet.infura.io/v3/${INFURA_API_KEY}`, // Polygon
  80001: `https://polygon-mumbai.infura.io/v3/${INFURA_API_KEY}`, // Mumbai Testnet
};

const servers = ExpressHttpStreamableMcpServer(
  { name: "chainql" },
  (server) => {
    // Tool: get ETH balance via Infura
    server.tool(
      "get_eth_balance",
      "Retrieve balance of an Ethereum address on a specified EVM chain, defaulting to mainnet.",
      {
        address: z.string().describe("Ethereum address to query"),
        chainid: z
          .number()
          .optional()
          .describe("EVM chain ID (default: 1 for Ethereum mainnet)"),
      },
      async ({ address, chainid }): Promise<CallToolResult> => {
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
            method: "eth_getBalance",
            params: [address, "latest"],
            id: 1,
          };

          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

          const data: any = await res.json();

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

          // Convert hex balance (wei) to ETH
          const balanceEth = (parseInt(data.result, 16) / 1e18).toString();

          return {
            content: [
              {
                type: "text",
                text: `Balance of ${address} on chain ${selectedChainId}: ${balanceEth} ETH`,
              },
            ],
          };
        } catch (err: any) {
          return {
            content: [
              {
                type: "text",
                text: `Error fetching balance: ${err.message}`,
              },
            ],
          };
        }
      }
    );
  }
);

export default servers;
