#!/usr/bin/env node
import { Command } from "commander";
import { fileURLToPath } from "url";
import { basename } from "path";
import { queryCommand } from "./commands/query.js";

const chainQL = new Command();

chainQL
  .name("chainQL")
  .description(
    "CLI tool to interact with blockchain networks in natural plain english"
  )
  .version("1.0.0");

// Register subcommands
chainQL.addCommand(queryCommand);

export function runCli(): void {
  try {
    chainQL.parse();
  } catch (error) {
    console.error("CLI Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// ESM-safe entrypoint check
const isMain =
  basename(fileURLToPath(import.meta.url)) === basename(process.argv[1] ?? "");

if (isMain) {
  runCli();
}
