import { ExpressHttpStreamableMcpServer } from "./server.js";
import { tools } from "./tools/index.js";

export const servers = ExpressHttpStreamableMcpServer(
  { name: "chainql" },
  (server) => {
    for (const tool of tools) {
      server.tool(tool.name, tool.description, tool.schema, tool.handler);
    }
  }
);
