import { ToolDefinition } from "../LlmClient";

export const searchCompanyTool: ToolDefinition = {
  name: "search_company",
  description: "Searches for public information about a company by its name or domain",
  parameters: {
    type: "object",
    properties: {
      companyName: { type: "string", description: "Name or domain of the company" },
    },
    required: ["companyName"],
  },
};

// Mock for now — a real call to an enrichment API goes here later.
export async function executeSearchCompany(args: { companyName: string }) {
  return {
    companyName: args.companyName,
    industry: "Technology",
    employees: "50-200",
    description: `${args.companyName} is a software company (simulated data, TODO connect real API)`,
  };
}
