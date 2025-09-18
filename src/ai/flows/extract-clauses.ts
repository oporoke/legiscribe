'use server';

/**
 * @fileOverview Extracts and structures individual clauses from a legislative bill.
 *
 * - extractClauses - A function that handles the clause extraction process.
 * - ExtractClausesInput - The input type for the extractClauses function.
 * - ExtractClausesOutput - The return type for the extractClauses function.
 */

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
Your task is to meticulously break down the provided bill text into its individual, distinct clauses.

- Analyze the entire structure of the document to identify distinct clauses. A clause can be a paragraph, a numbered or lettered item, or any other distinct section of the text. Do not omit any part of the document.
- Pay close attention to the document's structure (Parts, sections, sub-sections). Ensure your extraction preserves this hierarchy implicitly in the sequence of clauses.
- Sequentially number each extracted clause, starting from 1.
- For each clause, create a unique ID in the format "clause-N", where N is its sequential number.
- The full, original text of each clause must be preserved without any modification whatsoever.
- Return the result as a structured JSON object containing a list of these clause objects.

Bill Text:
{{{billText}}}`,
});

const extractClausesFlow = ai.defineFlow(
  {
    name: 'extractClausesFlow',
    inputSchema: ExtractClausesInputSchema,
    outputSchema: ExtractClausesOutputSchema,
  },
  async (input) => {
    const { output } = await extractClausesPrompt(input);
    if (!output) {
      console.error('Clause extraction failed to produce an output.');
      return { clauses: [] };
    }
    return output;
  }
);
