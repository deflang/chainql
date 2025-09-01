import fs from "fs";
import path from "path";

export interface ChainQLConfig {
  provider?: string | undefined;
  model?: string | undefined;
  apiUrl?: string | undefined;
}

export function loadConfig(
  cliFlags: Partial<ChainQLConfig> = {}
): ChainQLConfig {
  const home = process.env["HOME"] || process.env["USERPROFILE"] || ".";
  const configPath = path.join(home, ".chainql", "config.json");

  let fileConfig: ChainQLConfig = {};
  if (fs.existsSync(configPath)) {
    fileConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  }

  const envConfig: ChainQLConfig = {
    provider: process.env["CHAINQL_PROVIDER"],
    model: process.env["OLLAMA_MODEL"],
    apiUrl: process.env["OLLAMA_API_URL"],
  };

  // Merge priority: CLI flags > config file > env > defaults
  return {
    provider:
      cliFlags.provider || fileConfig.provider || envConfig.provider || "mock",
    model: cliFlags.model || fileConfig.model || envConfig.model || "default",
    apiUrl:
      cliFlags.apiUrl ||
      fileConfig.apiUrl ||
      envConfig.apiUrl ||
      "http://localhost:11434",
  };
}
