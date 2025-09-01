import type { QueryPlan } from "./queryPlan.js";
import { loadConfig } from "./config.js";

export interface LLMProvider {
  generateQueryPlan(nlQuery: string): Promise<QueryPlan>;
}

// ----------------------
// MOCK PROVIDER (for dev/local)
// ----------------------
export class MockLLMProvider implements LLMProvider {
  async generateQueryPlan(nlQuery: string): Promise<QueryPlan> {
    console.log("MockLLMProvider received query:", nlQuery);

    return {
      version: "1.0",
      action: "read",
      network: { chain: "ethereum", network: "mainnet" },
      target: {
        type: "contract",
        protocol: "ERC20",
        address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      },
      query: {
        method: "event",
        event: "Transfer",
        filters: { minValueUSD: 100000 },
      },
      output: { format: "json", limit: 50, pagination: false },
    };
  }
}

// ----------------------
// Ollama Provider (Production-ready)
// ----------------------
interface OllamaOptions {
  apiUrl: string; // e.g., "http://localhost:11434"
  model: string; // e.g., "llama2"
}

interface OllamaResponse {
  completion?: string;
  text?: string;
}

export class OllamaProvider implements LLMProvider {
  private apiUrl: string;
  private model: string;

  constructor(options: OllamaOptions) {
    this.apiUrl = options.apiUrl;
    this.model = options.model;
  }

  async generateQueryPlan(nlQuery: string): Promise<QueryPlan> {
    const response = await fetch(`${this.apiUrl}/v1/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        prompt: nlQuery,
        stream: false, // enable streaming if needed later
        max_tokens: 512,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Ollama API Error: ${response.status} ${response.statusText}`
      );
    }

    const data: OllamaResponse = await response.json();

    try {
      // Ensure we get a string from `completion` or `text`
      const jsonText = data.completion ?? data.text;
      if (!jsonText) {
        throw new Error("Ollama returned empty response");
      }

      const plan: QueryPlan = JSON.parse(jsonText);
      return plan;
    } catch (err) {
      throw new Error(
        `Failed to parse Ollama response as QueryPlan: ${err instanceof Error ? err.message : err}`
      );
    }
  }
}

// ----------------------
// Factory function to get provider based on config/env/CLI
// ----------------------
export function getLLMProvider(
  cliFlags: Partial<{ provider: string; model: string; apiUrl: string }> = {}
): LLMProvider {
  const config = loadConfig(cliFlags);

  if (config.provider === "ollama") {
    if (!config.model || !config.apiUrl) {
      throw new Error(
        "Ollama provider requires `model` and `apiUrl` in config/flags"
      );
    }

    return new OllamaProvider({
      apiUrl: config.apiUrl,
      model: config.model,
    });
  }

  return new MockLLMProvider();
}
