'use server';

/**
 * @fileOverview Compares two legislative bills and highlights the differences.
 *
 * - compareBills - A function that provides a comparison between two bills.
 * - CompareBillsInput - The input type for the compareBills function.
 * - CompareBillsOutput - The return type for the compareBills function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const CompareBillsInputSchema = z.object({
  originalBillText: z.string().describe('The text of the original bill.'),
  amendedBillText: z.string().describe('The text of the amended bill.'),
});

export type CompareBillsInput = z.infer<typeof CompareBillsInputSchema>;

const ComparisonSectionSchema = z.object({
  sectionTitle: z.string().describe('The title of the section that has changed (e.g., "Clause 5: Penalties").'),
  originalText: z.string().describe('The original text of the section.'),
  amendedText: z.string().describe('The amended text of the section.'),
  implication: z.string().describe('The legal or practical implication of the change.'),
});

const CompareBillsOutputSchema = z.object({
  comparisonSummary: z.string().describe('A high-level summary of the most significant changes between the two bills.'),
  changedSections: z.array(ComparisonSectionSchema).describe('A list of sections that have been changed between the bills.'),
});

export type CompareBillsOutput = z.infer<typeof CompareBillsOutputSchema>;

export async function compareBills(input: CompareBillsInput): Promise<CompareBillsOutput> {
  return compareBillsFlow(input);
}

const compareBillsPrompt = ai.definePrompt({
  name: 'compareBillsPrompt',
  input: { schema: CompareBillsInputSchema },
  output: { schema: CompareBillsOutputSchema },
  prompt: `You are an expert legal analyst. Your task is to compare two versions of a legislative bill and produce a detailed report on the changes.

You must identify which clauses or sections have been added, removed, or modified. For each change, you must explain the legal and practical implication of that change.

Original Bill:
"{{{originalBillText}}}"

Amended Bill:
"{{{amendedBillText}}}"
`,
});

const compareBillsFlow = ai.defineFlow(
  {
    name: 'compareBillsFlow',
    inputSchema: CompareBillsInputSchema,
    outputSchema: CompareBillsOutputSchema,
  },
  async (input) => {
    const { output } = await compareBillsPrompt(input);
    if (!output) {
      console.error('Comparison generation failed to produce an output.');
      return { comparisonSummary: '', changedSections: [] };
    }
    return output;
  }
);
