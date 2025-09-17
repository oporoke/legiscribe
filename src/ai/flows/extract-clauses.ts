'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ExtractClausesInputSchema = z.object({
  billText: z.string().describe('The text content of the legislative bill.'),
});

const ClauseSchema = z.object({
  clauseId: z.string().describe('A unique identifier for the clause, e.g., "clause-1".'),
  clauseNumber: z.number().describe('The sequential number of the clause.'),
  text: z.string().describe('The full text of the clause.'),
});

const ExtractClausesOutputSchema = z.object({
  clauses: z.array(ClauseSchema).describe('An array of extracted clauses from the bill.'),
});

export type ExtractClausesInput = z.infer<typeof ExtractClausesInputSchema>;
export type ExtractClausesOutput = z.infer<typeof ExtractClausesOutputSchema>;

export async function extractClauses(input: ExtractClausesInput): Promise<ExtractClausesOutput> {
  return extractClausesFlow(input);
}

const extractClausesPrompt = ai.definePrompt({
  name: 'extractClausesPrompt',
  input: { schema: ExtractClausesInputSchema },
  output: { schema: ExtractClausesOutputSchema },
  prompt: `You are an expert legal assistant specializing in parsing legislative documents.
Your task is to break down the provided bill text into individual clauses or provisions.

- Analyze the structure of the document. A clause can be a paragraph, a numbered or lettered item, or a distinct section.
- Identify each distinct clause or provision.
- Number each clause sequentially starting from 1.
- For each clause, create a unique ID in the format "clause-N", where N is the clause number.
- Ensure the full, original text of each clause is preserved.
- Return the result as a structured list of objects.

Bill Text:
{{billText}}`,
});

const extractClausesFlow = ai.defineFlow(
  {
    name: 'extractClausesFlow',
    inputSchema: ExtractClausesInputSchema,
    outputSchema: ExtractClausesOutputSchema,
  },
  async (input) => {
    const { output } = await extractClausesPrompt(input);
    return output!;
  }
);
