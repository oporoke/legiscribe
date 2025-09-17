'use server';

/**
 * @fileOverview Explains a specific legislative clause in the context of the entire bill.
 *
 * - explainClause - A function that provides an explanation for a clause.
 * - ExplainClauseInput - The input type for the explainClause function.
 * - ExplainClauseOutput - The return type for the explainClause function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ExplainClauseInputSchema = z.object({
  clauseText: z.string().describe('The specific clause text to be explained.'),
  billText: z.string().describe('The full text of the legislative bill for context.'),
});

export type ExplainClauseInput = z.infer<typeof ExplainClauseInputSchema>;

const ExplainClauseOutputSchema = z.object({
  explanation: z.string().describe('The detailed explanation of the clause.'),
});

export type ExplainClauseOutput = z.infer<typeof ExplainClauseOutputSchema>;

export async function explainClause(input: ExplainClauseInput): Promise<ExplainClauseOutput> {
  return explainClauseFlow(input);
}

const explainClausePrompt = ai.definePrompt({
  name: 'explainClausePrompt',
  input: { schema: ExplainClauseInputSchema },
  output: { schema: ExplainClauseOutputSchema },
  prompt: `You are an expert legal analyst. Your task is to explain a specific clause from a legislative bill in simple, easy-to-understand terms.
You must consider the context of the entire bill to provide an accurate and relevant explanation.

Explain the purpose, meaning, and potential implications of the following clause.

Clause to Explain:
"{{{clauseText}}}"

Full Bill Context:
"{{{billText}}}"
`,
});

const explainClauseFlow = ai.defineFlow(
  {
    name: 'explainClauseFlow',
    inputSchema: ExplainClauseInputSchema,
    outputSchema: ExplainClauseOutputSchema,
  },
  async (input) => {
    const { output } = await explainClausePrompt(input);
    if (!output) {
      console.error('Explanation generation failed to produce an output.');
      return { explanation: 'Could not generate an explanation at this time.' };
    }
    return output;
  }
);
