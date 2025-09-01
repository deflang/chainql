import Table from "cli-table3";
import type { QueryPlan } from "./queryPlan.js";

/**
 * Print data in the requested format (json, csv, table).
 *
 * @param data - Array of objects to display
 * @param output - Output options from QueryPlan
 */
export function printOutput(
  data: Record<string, unknown>[],
  output: QueryPlan["output"]
): void {
  switch (output.format) {
    case "json": {
      console.log(JSON.stringify(data, null, 2));
      break;
    }

    case "csv": {
      console.log(toCSV(data));
      break;
    }

    case "table": {
      if (data.length === 0) {
        console.log("No results.");
        return;
      }
      const headers = data.length > 0 ? Object.keys(data[0]!) : [];
      const table = new Table({ head: headers });

      data.forEach((row) => {
        const values = headers.map((h) =>
          row[h] !== undefined ? String(row[h]) : ""
        );
        table.push(values);
      });

      console.log(table.toString());
      break;
    }

    default: {
      console.error(`Unknown format: ${output.format}`);
    }
  }
}

/**
 * Convert array of objects into CSV string
 *
 * @param data - Array of objects
 * @returns CSV string
 */
function toCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return "";

  const headers = data[0] ? Object.keys(data[0]) : [];
  const rows = data.map((row) =>
    headers
      .map((h) => (row[h] !== undefined ? JSON.stringify(row[h]) : ""))
      .join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}
