import 'dotenv/config';
const INFURA_API_KEY: string = process.env.INFURA_API_KEY || "";
if (!INFURA_API_KEY) throw new Error("INFURA_API_KEY is not set");

export const INFURA_CHAIN_URLS: Record<number, string> = {
  1: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
  137: `https://polygon-mainnet.infura.io/v3/${INFURA_API_KEY}`,
};

export const WRITE_TOOLS_ENABLED = process.env.WRITE_TOOLS_ENABLED === "true";