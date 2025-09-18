'use server';

/**
 * @fileOverview Analyzes a legislative bill to identify its historical context and legal precedents.
 *
 * - analyzePrecedent - A function that provides an analysis of legal precedents.
 * - AnalyzePrecedentInput - The input type for the analyzePrecedent function.
 * - AnalyzePrecedentOutput - The return type for the analyzePrecedent function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AnalyzePrecedentInputSchema = z.object({
  billText: z.string().describe('The full text of the legislative bill.'),
});

export type AnalyzePrecedentInput = z.infer<typeof AnalyzePrecedentInputSchema>;

const PrecedentSchema = z.object({
  precedentName: z.string().describe('The name of the precedent, e.g., "The Civil Rights Act of 1964" or "Marbury v. Madison".'),
  description: z.string().describe('A description of how the current bill relates to, modifies, or is influenced by this precedent.'),
});

const AnalyzePrecedentOutputSchema = z.object({
  historicalContext: z.string().describe("A summary of the historical context or legal evolution leading up to this bill."),
  precedents: z.array(PrecedentSchema).describe('An array of identified legal precedents or related historical laws.'),
});

export type AnalyzePrecedentOutput = z.infer<typeof AnalyzePrecedentOutputSchema>;


export async function analyzePrecedent(input: AnalyzePrecedentInput): Promise<AnalyzePrecedentOutput> {
  return analyzePrecedentFlow(input);
}

const analyzePrecedentPrompt = ai.definePrompt({
  name: 'analyzePrecedentPrompt',
  input: { schema: AnalyzePrecedentInputSchema },
  output: { schema: AnalyzePrecedentOutputSchema },
  prompt: `You are an expert legal historian. Your task is to analyze the provided legislative bill and report on its historical and legal precedents.

- **Analyze Historical Context**: Based on the content of the bill, provide a summary of the legal or societal history that likely led to its creation.
- **Identify Precedents**: Identify key historical laws, landmark court cases, or established legal principles that are relevant to this bill.
- **Describe the Relationship**: For each precedent identified, explain its relationship to the current bill. Does the bill extend, modify, contradict, or codify the precedent?

Your analysis must be objective and based on established legal and historical facts.

Bill Text:
"{{{billText}}}"
`,
});

const analyzePrecedentFlow = ai.defineFlow(
  {
    name: 'analyzePrecedentFlow',
    inputSchema: AnalyzePrecedentInputSchema,
    outputSchema: AnalyzePrecedentOutputSchema,
  },
  async (input) => {
    const { output } = await analyzePrecedentPrompt(input);
    if (!output) {
      console.error('Precedent analysis failed to produce an output.');
      return { historicalContext: '', precedents: [] };
    }
    return output;
  }
);
