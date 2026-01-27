# MCP Server Scaffold Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a TypeScript MCP server with a single empty `get_eligibilities` tool using stdio transport.

**Architecture:** Single-file MCP server using `@modelcontextprotocol/sdk`. Registers one tool with an empty handler. Connects via stdio transport.

**Tech Stack:** TypeScript, `@modelcontextprotocol/sdk`, Node.js

---

### Task 1: Initialize TypeScript project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`

**Step 1: Initialize npm project**

Run: `npm init -y`

**Step 2: Install dependencies**

Run: `npm install @modelcontextprotocol/sdk zod`
Run: `npm install --save-dev typescript @types/node`

**Step 3: Configure tsconfig.json**

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./build",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"]
}
```

**Step 4: Add build and start scripts to package.json**

Add to `package.json` scripts:
```json
"scripts": {
  "build": "tsc",
  "start": "node build/index.js"
}
```

Also set `"type": "module"` in package.json.

**Step 5: Commit**

```bash
git add package.json tsconfig.json package-lock.json
git commit -m "chore: initialize TypeScript project with MCP SDK"
```

---

### Task 2: Create MCP server with get_eligibilities tool

**Files:**
- Create: `src/index.ts`

**Step 1: Write src/index.ts**

```typescript
#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new McpServer({
  name: "arcep-api-eligibility",
  version: "1.0.0",
});

async function getEligibilities(): Promise<string> {
  return "Not implemented yet";
}

server.tool(
  "get_eligibilities",
  "Get eligibilities from the ARCEP API",
  {},
  async () => {
    const result = await getEligibilities();
    return {
      content: [{ type: "text", text: result }],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
```

**Step 2: Build the project**

Run: `npm run build`
Expected: Compiles without errors, creates `build/index.js`

**Step 3: Commit**

```bash
git add src/index.ts
git commit -m "feat: add MCP server with empty get_eligibilities tool"
```

---

### Task 3: Add .gitignore and finalize

**Files:**
- Create: `.gitignore`

**Step 1: Create .gitignore**

```
node_modules/
build/
```

**Step 2: Commit**

```bash
git add .gitignore
git commit -m "chore: add gitignore"
```
