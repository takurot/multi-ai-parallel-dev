import { zodToJsonSchema } from "zod-to-json-schema";
import { TasksFileSchema } from "../src/tasks/schema.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonSchema = zodToJsonSchema(TasksFileSchema, "TasksFile");

const outputPath = path.join(__dirname, "../src/tasks/schema.json");
fs.writeFileSync(outputPath, JSON.stringify(jsonSchema, null, 2));

console.log(`Generated schema at ${outputPath}`);
