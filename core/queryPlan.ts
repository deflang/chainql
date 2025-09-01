import { z } from "zod";

export const QueryPlanSchema = z.object({
  version: z.string().default("1.0"),
  action: z.enum(["read", "write"]),
  network: z.object({
    chain: z.string(),
    network: z.string().optional(),
    rpcUrl: z.string().optional(),
  }),
  target: z.object({
    type: z.enum(["contract", "account", "protocol"]),
    address: z.string().optional(),
    name: z.string().optional(),
    abi: z.string().optional(),
    protocol: z.string().optional(),
  }),
  query: z.union([
    z.object({
      method: z.enum(["event", "call", "balance"]),
      event: z.string().optional(),
      function: z.string().optional(),
      filters: z.record(z.string(), z.any()).optional(),
      timeRange: z
        .object({
          from: z.iso.datetime().optional(),
          to: z.iso.datetime().optional(),
        })
        .optional(),
    }),
    z.object({
      method: z.literal("transaction"),
      function: z.string(),
      args: z.record(z.string(), z.any()),
      value: z.string().optional(),
      gas: z.string().optional(),
    }),
  ]),
  output: z.object({
    format: z.enum(["json", "table", "csv"]).default("json"),
    limit: z.number().optional(),
    pagination: z.boolean().default(false),
  }),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type QueryPlan = z.infer<typeof QueryPlanSchema>;
