import express from "express";
import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { InMemoryEventStore } from "@modelcontextprotocol/sdk/examples/shared/inMemoryEventStore.js";
import {
  isInitializeRequest,
} from "@modelcontextprotocol/sdk/types.js";

const PORT = process.env.PORT || 3000;

interface ServerOptions {
  name: string;
}

export const ExpressHttpStreamableMcpServer = (
  options: ServerOptions,
  setupCb: (server: McpServer) => void
) => {
  const server = new McpServer({
    name: options.name,
    version: "1.0.0",
  });

  setupCb(server);

  const app = express();
  app.use(express.json());

  const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

  app.post("/mcp", async (req, res) => {
    try {
      const sessionId = req.headers["mcp-session-id"] as string | undefined;
      let transport: StreamableHTTPServerTransport;

      if (sessionId && transports[sessionId]) {
        transport = transports[sessionId];
      } else if (!sessionId && isInitializeRequest(req.body)) {
        const eventStore = new InMemoryEventStore();
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          enableJsonResponse: true,
          eventStore,
          onsessioninitialized: (sid) => {
            transports[sid] = transport;
          },
        });

        transport.onclose = () => {
          const sid = transport.sessionId;
          if (sid && transports[sid]) delete transports[sid];
        };

        await server.connect(transport);
        await transport.handleRequest(req, res, req.body);
        return;
      } else {
        res.status(400).json({
          jsonrpc: "2.0",
          error: {
            code: -32000,
            message: "Bad Request: No valid session ID provided",
          },
          id: null,
        });
        return;
      }

      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error("Error handling MCP request:", error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: { code: -32603, message: "Internal server error" },
          id: null,
        });
      }
    }
  });

  app.get("/mcp", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (!sessionId || !transports[sessionId]) {
      res.status(400).send("Invalid or missing session ID");
      return;
    }
    const transport = transports[sessionId];
    await transport.handleRequest(req, res);
  });

  app.delete("/mcp", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (!sessionId || !transports[sessionId]) {
      res.status(400).send("Invalid or missing session ID");
      return;
    }
    const transport = transports[sessionId];
    await transport.handleRequest(req, res);
    delete transports[sessionId];
  });

  const express_server = app.listen(PORT, () => {
    console.log(`MCP Streamable HTTP Server listening on port ${PORT}`);
  });

  process.on("SIGINT", async () => {
    console.log("Shutting down server...");
    for (const sessionId in transports) {
      try {
        if (transports[sessionId]) {
          await transports[sessionId].close();
        }
      } catch {}
      delete transports[sessionId];
    }
    express_server.close();
    await server.close();
    console.log("Server shutdown complete");
    process.exit(0);
  });

  return { process, server, express_server };
};
