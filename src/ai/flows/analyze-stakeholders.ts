'use server';

/**
 * @fileOverview Analyzes a legislative bill to identify and report on its impact on various stakeholders.
 *
 * - analyzeStakeholders - A function that provides an analysis of stakeholder impacts.
 * - AnalyzeStakeholdersInput - The input type for the analyzeStakeholders function.
 * - AnalyzeStakeholdersOutput - The return type for the analyzeStakeholders function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AnalyzeStakeholdersInputSchema = z.object({
  billText: z.string().describe('The full text of the legislative bill.'),
});

export type AnalyzeStakeholdersInput = z.infer<typeof AnalyzeStakeholdersInputSchema>;

const StakeholderImpactSchema = z.object({
  stakeholderGroup: z.string().describe('The name of the stakeholder group (e.g., "Small Business Owners", "Low-Income Families", "Tech Industry").'),
  impactSummary: z.string().describe('A summary of how the bill will generally affect this group.'),
  potentialEffects: z.array(z.string()).describe('A list of specific potential positive or negative effects on the group.'),
});

const AnalyzeStakeholdersOutputSchema = z.object({
  overallImpactSummary: z.string().describe("A high-level summary of the bill's main societal and economic impact."),
  stakeholderImpacts: z.array(StakeholderImpactSchema).describe('An array of detailed impacts on different stakeholder groups.'),
});

export type AnalyzeStakeholdersOutput = z.infer<typeof AnalyzeStakeholdersOutputSchema>;


export async function analyzeStakeholders(input: AnalyzeStakeholdersInput): Promise<AnalyzeStakeholdersOutput> {
  return analyzeStakeholdersFlow(input);
}

const analyzeStakeholdersPrompt = ai.definePrompt({
  name: 'analyzeStakeholdersPrompt',
  input: { schema: AnalyzeStakeholdersInputSchema },
  output: { schema: AnalyzeStakeholdersOutputSchema },
  prompt: `You are an expert public policy and economic analyst. Your task is to analyze the provided legislative bill and create a detailed report on its potential impact on various stakeholders.

- **Identify Stakeholders**: Identify the key industries, demographics, geographic regions, or other groups that will be most affected by this bill.
- **Summarize Impact**: For each stakeholder group, provide a neutral, evidence-based summary of the potential impact.
- **Detail Effects**: List specific potential effects, both positive and negative. Consider financial, regulatory, social, and operational impacts.
- **Overall Summary**: Start with a high-level summary of the bill's primary societal and economic consequences.

Do not express personal opinions or political bias. Your analysis must be based solely on the text of the bill provided.

Bill Text:
"{{{billText}}}"
`,
});

const analyzeStakeholdersFlow = ai.defineFlow(
  {
    name: 'analyzeStakeholdersFlow',
    inputSchema: AnalyzeStakeholdersInputSchema,
    outputSchema: AnalyzeStakeholdersOutputSchema,
  },
  async (input) => {
    const { output } = await analyzeStakeholdersPrompt(input);
    if (!output) {
      console.error('Stakeholder analysis failed to produce an output.');
      return { overallImpactSummary: '', stakeholderImpacts: [] };
    }
    return output;
  }
);
