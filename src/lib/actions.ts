'use server';

import { extractClauses } from '@/ai/flows/extract-clauses';
import { summarizeBill } from '@/ai/flows/summarize-bill';
import type { ProcessedBill } from '@/lib/types';
import { z } from 'zod';
import { handleFileUpload } from './actions/handle-file-upload';
import { GoogleGenerativeAIError } from '@google/generative-ai';

const ProcessBillInput = z.object({
  fileName: z.string(),
  fileContent: z.string(),
  fileType: z.string(),
});

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function processBill(
  input: z.infer<typeof ProcessBillInput>
): Promise<{ bill: ProcessedBill | null; error: string | null }> {
  const validatedInput = ProcessBillInput.safeParse(input);
  if (!validatedInput.success) {
    return { bill: null, error: 'Invalid input.' };
  }
  
  const { fileName, fileContent, fileType } = validatedInput.data;
  
  let billText: string;
  try {
    billText = await handleFileUpload({
      fileName,
      fileContent,
      fileType,
    });
  } catch (error) {
    return { bill: null, error: error instanceof Error ? error.message : 'Failed to read file.' };
  }

  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const [clausesResult, summaryResult] = await Promise.all([
        extractClauses({ billText: billText }),
        summarizeBill({ billText: billText })
      ]);

      if (!clausesResult?.clauses || !summaryResult?.summary) {
        throw new Error('AI processing failed to return expected results. The summary or clauses were not generated.');
      }

      const processedBill: ProcessedBill = {
        id: new Date().toISOString(),
        fileName: fileName,
        originalText: billText,
        clauses: clausesResult.clauses,
        summary: summaryResult.summary,
      };

      return { bill: processedBill, error: null };
    } catch (error: unknown) {
      console.error(`Error processing bill (attempt ${attempt}):`, error);

      let isServiceUnavailable = false;
      let isRateLimited = false;

      if (error instanceof GoogleGenerativeAIError) {
        isServiceUnavailable = error.status === 503;
        isRateLimited = error.status === 429;
      } else if (error instanceof Error) {
        // Fallback for other error types that might include status codes in their message
        isServiceUnavailable = error.message.includes('503');
        isRateLimited = error.message.includes('429');
      }

      if ((isServiceUnavailable || isRateLimited) && attempt < maxRetries) {
        await sleep(1000 * attempt); // Wait longer between retries
        continue;
      }
      
      if (isServiceUnavailable) {
        return {
          bill: null,
          error: 'The AI service is temporarily unavailable due to high demand. Please try again in a few moments.',
        };
      }
      
      if (isRateLimited) {
        return {
          bill: null,
          error: 'You have exceeded the free usage quota for the AI model. Please check your plan and billing details, or try again later.',
        };
      }
      
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
      return {
        bill: null,
        error: `An unexpected error occurred while processing the bill: ${errorMessage}. Please try again.`,
      };
    }
  }

  return {
    bill: null,
    error: 'Failed to process the bill after multiple attempts. The service may be busy. Please try again later.',
  };
}
