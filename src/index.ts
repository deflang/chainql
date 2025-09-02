import { z } from "zod";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { ExpressHttpStreamableMcpServer } from "./server.js";
import 'dotenv/config';

const INFURA_API_KEY: string = process.env.INFURA_API_KEY || '';
if (!INFURA_API_KEY) throw new Error("INFURA_API_KEY is not set");

const servers = ExpressHttpStreamableMcpServer(
  { name: "chainql" },
  (server) => {
    // Tool: get ETH balance via Infura
    server.tool(
      "get_eth_balance",
      "Retrieve balance of an Ethereum address",
      {
        address: z.string().describe("Ethereum address to query"),
      },
      async ({ address }): Promise<CallToolResult> => {
        try {
          const url = `https://mainnet.infura.io/v3/${INFURA_API_KEY}`;

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
                  text: `Error fetching balance: ${data.error?.message || "Unknown error"}`,
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
                text: `Balance of ${address}: ${balanceEth} ETH`,
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
