import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { GoogleGenAI, Part } from "npm:@google/genai@^1.22.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const { promptText, binaryDocuments } = await req.json();

    const ai = new GoogleGenAI({ apiKey });

    const textPart: Part = { text: promptText };
    const binaryDocumentParts: Part[] = binaryDocuments.map((doc: any) => ({
      inlineData: { data: doc.data, mimeType: doc.mimeType }
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [textPart, ...binaryDocumentParts] },
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const responseText = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return new Response(
      JSON.stringify({ responseText, sources }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

