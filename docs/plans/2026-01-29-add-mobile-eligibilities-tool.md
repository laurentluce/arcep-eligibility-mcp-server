# Add Mobile Eligibilities Tool Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a `get_mobile_eligibilities` MCP tool that takes a street address and town name and returns mobile eligibility data from the ARCEP API.

**Architecture:** Add `Building` interface and `getBuilding` function to retrieve building coordinates. Add `getMobileEligibilities` and `getMobileEligibilitiesByAddress` functions. Register new tool. Update README.

**Tech Stack:** TypeScript, `@modelcontextprotocol/sdk`, Node.js native fetch

---

### Task 1: Add getBuilding and mobile eligibilities functions

**Files:**
- Modify: `src/index.ts`

**Step 1: Add Building interface and getBuilding function**

After the `getAddress` function (line 59), add:

```typescript
interface Building {
  srid: number;
  x: number;
  y: number;
}

async function getBuilding(buildingId: number): Promise<Building> {
  const data = (await arcepFetch("/immeubles/immeuble", {
    immeubleid: String(buildingId),
  })) as Building;
  if (!data.x || !data.y) {
    throw new Error(`No coordinates found for building: ${buildingId}`);
  }
  return data;
}
```

**Step 2: Add getMobileEligibilities and orchestrator**

After the new `getBuilding` function, add:

```typescript
async function getMobileEligibilities(srid: number, x: number, y: number): Promise<unknown> {
  return arcepFetch("/eligibilites/mobile", {
    srid: String(srid),
    x: String(x),
    y: String(y),
  });
}

async function getMobileEligibilitiesByAddress(
  streetAddress: string,
  townName: string
): Promise<string> {
  const town = await getTown(townName);
  const address = await getAddress(streetAddress, town.comid);
  const building = await getBuilding(address.immeubleid);
  const eligibilities = await getMobileEligibilities(building.srid, building.x, building.y);
  return JSON.stringify(eligibilities, null, 2);
}
```

**Step 3: Register the new tool**

After the existing `server.tool(...)` block (after line 101), add:

```typescript
server.tool(
  "get_mobile_eligibilities",
  "Get mobile eligibilities for an address from the ARCEP API.",
  {
    streetAddress: z.string().describe("The street address to look up (e.g. '10 rue de la Paix')"),
    townName: z.string().describe("The town/commune name (e.g. 'Paris')"),
  },
  async ({ streetAddress, townName }) => {
    try {
      const result = await getMobileEligibilitiesByAddress(streetAddress, townName);
      return {
        content: [{ type: "text", text: result }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text", text: `Error: ${message}` }],
        isError: true,
      };
    }
  }
);
```

**Step 4: Build the project**

Run: `npm run build`
Expected: Compiles without errors

**Step 5: Commit**

```bash
git add src/index.ts
git commit -m "feat: add get_mobile_eligibilities tool"
```

---

### Task 2: Update README

**Files:**
- Modify: `README.md`

**Step 1: Update README**

Change the intro line to mention both fixed-line and mobile:

```markdown
An MCP server that queries the [ARCEP](https://www.arcep.fr/) eligibility API to check fixed-line and mobile telecom eligibilities for a given address in France.
```

Change `## Tool` to `## Tools`.

After the existing `get_fixed_line_eligibilities` section, add:

```markdown
### get_mobile_eligibilities

Returns mobile eligibility data for a given street address and town in France.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `streetAddress` | string | Street address (e.g. "10 rue de la Paix") |
| `townName` | string | Town name (e.g. "Paris") |
```

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add get_mobile_eligibilities to README"
```
