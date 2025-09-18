'use server';

/**
 * @fileOverview Summarizes a legislative bill while preserving legal meaning, intent, and formatting.
 *
 * - summarizeBill - A function that summarizes the bill.
 * - SummarizeBillInput - The input type for the summarizeBill function.
 * - SummarizeBillOutput - The return type for the summarizeBill function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeBillInputSchema = z.object({
  billText: z.string().describe('The text content of the legislative bill.'),
});

export type SummarizeBillInput = z.infer<typeof SummarizeBillInputSchema>;

const SummarizeBillOutputSchema = z.object({
  summary: z.string().describe('The summarized text of the legislative bill, formatted as a detailed executive summary.'),
});

export type SummarizeBillOutput = z.infer<typeof SummarizeBillOutputSchema>;

export async function summarizeBill(input: SummarizeBillInput): Promise<SummarizeBillOutput> {
  return summarizeBillFlow(input);
}

const summarizeBillPrompt = ai.definePrompt({
  name: 'summarizeBillPrompt',
  input: {schema: SummarizeBillInputSchema},
  output: {schema: SummarizeBillOutputSchema},
  prompt: `You are an expert legal analyst. Your primary task is to create an exhaustive, multi-level summary of the provided legislative bill. The summary must be structured, detailed, and preserve the original legal intent.

Your output must follow this format precisely:

## BILL SUMMARY - [Extract Bill Title from Document]

### Overview
- **Purpose**: [Main objective in 2-3 sentences]
- **Scope**: [What activities/sectors does it cover]
- **Key Changes**: [Major changes from previous legislation, if apparent]

### Part-by-Part and Clause-by-Clause Summary
For each Part in the bill, you must do the following:
1.  Identify the Part number and Title.
2.  List all clause numbers contained within that Part.
3.  Provide a concise, one-sentence summary for EVERY clause within that Part. Do not skip any clauses.

**PART I - [Part Title]**
**Clauses**: [List all clause numbers, e.g., 1, 2, 3, 4]
- **Clause 1**: [One-sentence summary of Clause 1]
- **Clause 2**: [One-sentence summary of Clause 2]
- **Clause 3**: [One-sentence summary of Clause 3]
[...continue for all clauses in this part...]

**PART II - [Part Title]**
**Clauses**: [List all clause numbers, e.g., 5, 6, 7]
- **Clause 5**: [One-sentence summary of Clause 5]
[...continue for all clauses in this part and for all subsequent parts...]

### Critical Provisions
- **Licensing Requirements**: [Summarize key licensing requirements]
- **Tax Rates/Fees**: [Summarize major rates and charges]
- **Penalties**: [Summarize the range of penalties and offenses]
- **Exemptions**: [Summarize who/what is exempt]
- **Implementation**: [Summarize timeline and enforcement mechanisms]

### Financial Impact
- [Analyze and summarize revenue projections if available]
- [Analyze and summarize cost implications for businesses/individuals]
- [Analyze and summarize implementation costs for the government]

Bill Text:
{{{billText}}}`,
});

const summarizeBillFlow = ai.defineFlow(
  {
    name: 'summarizeBillFlow',
    inputSchema: SummarizeBillInputSchema,
    outputSchema: SummarizeBillOutputSchema,
  },
  async input => {
    const {output} = await summarizeBillPrompt(input);
    if (!output) {
      console.error('Summarization failed to produce an output.');
      return { summary: '' };
    }
    return output;
  }
);
