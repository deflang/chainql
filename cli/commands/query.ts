import { Command } from "commander";
import { QueryPlanSchema, type QueryPlan } from "../../core/queryPlan.js";
import { getLLMProvider } from "../../core/llm.js";
import { printOutput } from "../../core/output.js";
import { z } from "zod";

export const queryCommand = new Command("query")
  .description("Run a natural language query against blockchain data")
  .argument(
    "<nlQuery...>",
    "Natural language query (e.g. 'show me usdc transfers last 24h')"
  )
  .option("-f, --format <format>", "Output format: json | table | csv", "json")
  .option("-l, --limit <number>", "Limit number of results", "50")
  .action(
    async (nlQuery: string[], options: { format: string; limit: string }) => {
      const queryText = nlQuery.join(" ");
      console.log(`\n📝 Query: ${queryText}\n`);

      try {
        // 1. Get LLM provider (stub or configured in ~/.chainQL/config.json)
        const llm = getLLMProvider();

        // 2. Generate query plan from NL input
        const rawPlan = await llm.generateQueryPlan(queryText);

        // 3. Validate query plan schema
        const result = QueryPlanSchema.safeParse(rawPlan);
        if (!result.success) {
          console.error("❌ Invalid query plan from LLM:");
          console.error(JSON.stringify(z.treeifyError(result.error), null, 2));
          process.exit(1);
        }
        const plan: QueryPlan = result.data;

        // 4. Override output options from CLI flags
        plan.output.format = options.format as QueryPlan["output"]["format"];
        plan.output.limit = parseInt(options.limit, 10);

        // 5. (Stub for now) Just echo the validated plan
        // Later: pass plan → executor
        printOutput([{ plan }], plan.output);
      } catch (error) {
        console.error("⚠️ Query execution failed:");
        console.error(error instanceof Error ? error.message : error);
        process.exit(1);
      }
    }
  );
