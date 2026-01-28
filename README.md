# ARCEP Eligibility MCP Server

An MCP server that queries the [ARCEP](https://www.arcep.fr/) eligibility API to check fixed-line telecom eligibilities for a given address in France.

## Tool

### get_fixed_line_eligibilities

Returns fixed-line eligibility data for a given street address and town in France.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `streetAddress` | string | Street address (e.g. "10 rue de la Paix") |
| `townName` | string | Town name (e.g. "Paris") |

## Setup

### Prerequisites

- Node.js 18+
- An ARCEP API key

### Build

```bash
npm install
npm run build
```

### Configuration

Set the `ARCEP_API_KEY` environment variable:

```bash
export ARCEP_API_KEY=your_api_key
```

### Usage with Claude Desktop

Add to your Claude Desktop config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "arcep-eligibility": {
      "command": "node",
      "args": ["/absolute/path/to/arcep-api-eligibility-mcp-server/build/index.js"],
      "env": {
        "ARCEP_API_KEY": "your_api_key"
      }
    }
  }
}
```

## License

ISC
