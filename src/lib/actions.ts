'use server';

import { summarizeBill } from '@/ai/flows/summarize-bill';
import { extractClauses } from '@/ai/flows/extract-clauses';
import { MOCK_BILL_TEXT } from '@/lib/mock-data';
import type { ProcessedBill } from '@/lib/types';
import { z } from 'zod';

const ProcessBillInput = z.object({
  fileName: z.string(),
});

export async function processBill(
  input: z.infer<typeof ProcessBillInput>
): Promise<{ bill: ProcessedBill | null; error: string | null }> {
  const validatedInput = ProcessBillInput.safeParse(input);
  if (!validatedInput.success) {
    return { bill: null, error: 'Invalid input.' };
  }
  
  const { fileName } = validatedInput.data;

  // In a real application, you would handle file upload here,
  // extract text from PDF/Word, and use that text.
  // For this demo, we're using mock data.
  const billText = MOCK_BILL_TEXT;

  try {
    const [summaryResult, clausesResult] = await Promise.all([
      summarizeBill({ billText }),
      extractClauses({ billText }),
    ]);

    if (!summaryResult?.summarizedBill || !clausesResult?.clauses) {
      throw new Error('AI processing failed to return expected results.');
    }

    const processedBill: ProcessedBill = {
      id: new Date().toISOString(),
      fileName: fileName,
      originalText: billText,
      summarizedText: summaryResult.summarizedBill,
      clauses: clausesResult.clauses,
    };

    return { bill: processedBill, error: null };
  } catch (error) {
    console.error('Error processing bill:', error);
    return {
      bill: null,
      error: 'An unexpected error occurred while processing the bill. Please try again.',
    };
  }
}
