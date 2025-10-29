// This file will replace geminiService.ts once Supabase Edge Functions are deployed
// For now, the app continues to use the direct API calls in geminiService.ts

import { supabase } from '../lib/supabase';

const FUNCTIONS_URL = 'https://xidaoszvrdgttvgrntfe.supabase.co/functions/v1';

export const callGeminiChat = async (messages: any[], systemInstruction: string) => {
  const { data, error } = await supabase.functions.invoke('gemini-chat', {
    body: { messages, systemInstruction }
  });

  if (error) throw error;
  return data.text;
};

export const callGeminiGenerateReport = async (conversationText: string, systemInstruction: string) => {
  const { data, error } = await supabase.functions.invoke('gemini-generate-report', {
    body: { conversationText, systemInstruction }
  });

  if (error) throw error;
  return data.reportData;
};

export const callGeminiLegalAssistant = async (promptText: string, binaryDocuments: any[]) => {
  const { data, error } = await supabase.functions.invoke('gemini-legal-assistant', {
    body: { promptText, binaryDocuments }
  });

  if (error) throw error;
  return { responseText: data.responseText, sources: data.sources };
};

export const callGeminiAnalyzeIncident = async (fullPrompt: string) => {
  const { data, error } = await supabase.functions.invoke('gemini-analyze-incident', {
    body: { fullPrompt }
  });

  if (error) throw error;
  return { analysis: data.analysis, sources: data.sources };
};

