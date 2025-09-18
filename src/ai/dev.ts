'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/extract-clauses.ts';
import '@/ai/flows/summarize-bill.ts';
import '@/ai/flows/explain-clause.ts';
import '@/ai/flows/compare-bills.ts';
import '@/ai/flows/analyze-stakeholders.ts';
import '@/ai/flows/analyze-precedent.ts';
