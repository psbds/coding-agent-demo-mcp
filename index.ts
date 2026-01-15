#!/usr/bin/env node
import boot from "mcp-dev-blueprints/dist/src/server/boot.js";

import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const knowledge_base_path = join(__dirname, "knowledge_base");

boot(knowledge_base_path);