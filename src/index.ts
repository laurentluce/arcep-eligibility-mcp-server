#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const ARCEP_BASE_URL = "https://dataviz.arcep.fr/api";

function getApiKey(): string {
  const key = process.env.ARCEP_API_KEY;
  if (!key) {
    throw new Error("ARCEP_API_KEY environment variable is not set");
  }
  return key;
}

async function arcepFetch(path: string, params: Record<string, string>): Promise<unknown> {
  const url = new URL(`${ARCEP_BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  const response = await fetch(url.toString(), {
    headers: { "x-access-token": getApiKey() },
  });
  if (!response.ok) {
    throw new Error(`ARCEP API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

interface Town {
  comid: number;
  nom: string;
  code_insee: string;
}

async function getTown(townName: string): Promise<Town> {
  const data = (await arcepFetch("/adresses/communes", { search: townName })) as Town[];
  if (data.length === 0) {
    throw new Error(`No town found for: ${townName}`);
  }
  return data[0];
}

interface Address {
  immeubleid: number;
  nom: string;
}

async function getAddress(streetAddress: string, townId: number): Promise<Address> {
  const data = (await arcepFetch("/adresses/adresses", {
    search: streetAddress,
    comid: String(townId),
  })) as Address[];
  if (data.length === 0) {
    throw new Error(`No address found for: ${streetAddress}`);
  }
  return data[0];
}

interface Building {
  code_adr: string;
  longitude: number;
  latitude: number;
  nom_commune: string;
}

async function getBuilding(buildingId: number): Promise<Building> {
  const data = (await arcepFetch("/immeubles/immeuble", {
    immeubleid: String(buildingId),
  })) as Building;
  if (!data.code_adr) {
    throw new Error(`No address code found for building: ${buildingId}`);
  }
  return data;
}

async function getFixedLineEligibilities(addressCode: string): Promise<unknown> {
  return arcepFetch("/eligibilites/fixe", { codeadr: addressCode });
}

async function getFixedLineEligibilitiesByAddress(
  streetAddress: string,
  townName: string
): Promise<string> {
  const town = await getTown(townName);
  const address = await getAddress(streetAddress, town.comid);
  const building = await getBuilding(address.immeubleid);
  const eligibilities = await getFixedLineEligibilities(building.code_adr);
  return JSON.stringify(eligibilities, null, 2);
}

const server = new McpServer({
  name: "arcep-api-eligibility",
  version: "1.0.0",
});

server.tool(
  "get_fixed_line_eligibilities",
  "Get fixed-line eligibilities for an address from the ARCEP API. Chains town lookup, address lookup, building lookup, and eligibility fetch.",
  {
    streetAddress: z.string().describe("The street address to look up (e.g. '10 rue de la Paix')"),
    townName: z.string().describe("The town/commune name (e.g. 'Paris')"),
  },
  async ({ streetAddress, townName }) => {
    try {
      const result = await getFixedLineEligibilitiesByAddress(streetAddress, townName);
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

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
