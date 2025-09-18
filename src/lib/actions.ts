'use server';

import { extractClauses } from '@/ai/flows/extract-clauses';
import { summarizeBill } from '@/ai/flows/summarize-bill';
import { explainClause as explainClauseFlow } from '@/ai/flows/explain-clause';
import { compareBills } from '@/ai/flows/compare-bills';
import { analyzeStakeholders } from '@/ai/flows/analyze-stakeholders';
import { analyzePrecedent } from '@/ai/flows/analyze-precedent';
import type { ProcessedBill } from '@/lib/types';
import { z } from 'zod';
import { handleFileUpload } from './actions/handle-file-upload';
import { GoogleGenerativeAIError } from '@google/generative-ai';

const ProcessBillInput = z.object({
  fileName: z.string(),
  fileContent: z.string(),
  fileType: z.string(),
  amendedFileName: z.string().optional(),
  amendedFileContent: z.string().optional(),
  amendedFileType: z.string().optional(),
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
  
  const { fileName, fileContent, fileType, amendedFileContent, amendedFileName, amendedFileType } = validatedInput.data;
  
  const isCompareMode = amendedFileContent && amendedFileName && amendedFileType;

  let billText: string;
  let amendedBillText: string | undefined;

  try {
    billText = await handleFileUpload({
      fileName,
      fileContent,
      fileType,
    });
    if (isCompareMode) {
      amendedBillText = await handleFileUpload({
        fileName: amendedFileName,
        fileContent: amendedFileContent,
        fileType: amendedFileType,
      });
    }
  } catch (error) {
    return { bill: null, error: error instanceof Error ? error.message : 'Failed to read file(s).' };
  }

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      // Run AI flows in parallel
      const [clausesResult, summaryResult, stakeholderAnalysisResult, precedentAnalysisResult] = await Promise.all([
        extractClauses({ billText }),
        summarizeBill({ billText }),
        analyzeStakeholders({ billText }),
        analyzePrecedent({ billText }),
      ]);

      if (!clausesResult?.clauses) {
        throw new Error('AI processing failed to produce valid clauses.');
      }
      
      if (!summaryResult?.summary) {
        throw new Error('AI processing failed to produce a valid summary.');
      }

      if (!stakeholderAnalysisResult) {
        throw new Error('AI processing failed to produce a valid stakeholder analysis.');
      }

      if (!precedentAnalysisResult) {
        throw new Error('AI processing failed to produce a valid precedent analysis.');
      }

      const processedBill: ProcessedBill = {
        id: new Date().toISOString(),
        fileName: isCompareMode ? `${fileName} vs. ${amendedFileName}` : fileName,
        originalText: billText,
        clauses: clausesResult.clauses,
        summary: summaryResult.summary,
        stakeholderAnalysis: stakeholderAnalysisResult,
        precedentAnalysis: precedentAnalysisResult,
      };

      // Comparison-specific processing
      if (isCompareMode && amendedBillText) {
         const comparisonResult = await compareBills({
           originalBillText: billText,
           amendedBillText: amendedBillText,
         });
         if (!comparisonResult) {
            throw new Error('AI processing failed to produce a valid comparison.');
         }
         processedBill.comparison = comparisonResult;
      }


      return { bill: processedBill, error: null };
    } catch (error: unknown) {
      console.error(`Error processing bill (attempt ${attempt}):`, error);

      let isServiceUnavailable = false;
      let isRateLimited = false;

      if (error instanceof GoogleGenerativeAIError) {
        isServiceUnavailable = error.status === 503;
        isRateLimited = error.status === 429;
      } else if (error instanceof Error) {
        const message = error.message.toLowerCase();
        isServiceUnavailable = message.includes('503') || message.includes('service unavailable');
        isRateLimited = message.includes('429') || message.includes('too many requests') || message.includes('rate limit');
      }

      if ((isServiceUnavailable || isRateLimited) && attempt < 3) {
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Retrying after ${delay}ms...`);
        await sleep(delay); 
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

const ExplainClauseInputSchema = z.object({
  clauseText: z.string(),
  billText: z.string(),
});

export async function explainClause(
  input: z.infer<typeof ExplainClauseInputSchema>
): Promise<string> {
  try {
    const result = await explainClauseFlow(input);
    if (!result.explanation) {
      throw new Error('The AI failed to generate an explanation. This may be due to service load or content restrictions.');
    }
    return result.explanation;
  } catch (error) {
    console.error('Error in explainClause server action:', error);
    
    let errorMessage = 'An unexpected error occurred while generating the explanation. Please try again.';

    if (error instanceof GoogleGenerativeAIError) {
      if (error.status === 429) {
        errorMessage = 'You have exceeded the free usage quota for the AI model. Please check your plan and billing details, or try again later.';
      } else if (error.status === 503) {
        errorMessage = 'The AI service is temporarily unavailable. Please try again in a few moments.';
      }
    }
    
    throw new Error(errorMessage);
  }
}
