#!/usr/bin/env node

import { ExpressHttpStreamableMcpServer } from "./server.js";
import { tools } from "./tools/index.js";

export const servers = ExpressHttpStreamableMcpServer(
  { name: "infura-mcp" },
  (server) => {
    for (const tool of tools) {
      server.tool(tool.name, tool.description, tool.schema, tool.handler);
    }
  }
);
