'use server';

import { z } from 'zod';
import pdf from 'pdf-parse-fork';
import mammoth from 'mammoth';

const FileUploadInputSchema = z.object({
  fileName: z.string(),
  fileContent: z.string(), // base64 encoded data url
  fileType: z.string(),
});

type FileUploadInput = z.infer<typeof FileUploadInputSchema>;

async function getTextFromTxt(fileContent: string): Promise<string> {
  const base64Data = fileContent.split(',')[1];
  if (!base64Data) {
    throw new Error('Invalid TXT file content.');
  }
  return Buffer.from(base64Data, 'base64').toString('utf-8');
}

async function getTextFromPdf(fileContent: string): Promise<string> {
  const base64Data = fileContent.split(',')[1];
  if (!base64Data) {
    throw new Error('Invalid PDF file content.');
  }
  const buffer = Buffer.from(base64Data, 'base64');
  const data = await pdf(buffer);
  return data.text;
}

async function getTextFromWord(fileContent: string): Promise<string> {
  const base64Data = fileContent.split(',')[1];
  if (!base64Data) {
    throw new Error('Invalid Word file content.');
  }
  const buffer = Buffer.from(base64Data, 'base64');
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}


export async function handleFileUpload(input: FileUploadInput): Promise<string> {
  const validatedInput = FileUploadInputSchema.safeParse(input);
  if (!validatedInput.success) {
    throw new Error('Invalid file upload input.');
  }

  const { fileContent, fileType } = validatedInput.data;

  switch (fileType) {
    case 'text/plain':
      return getTextFromTxt(fileContent);
    case 'application/pdf':
      return getTextFromPdf(fileContent);
    case 'application/msword':
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return getTextFromWord(fileContent);
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}