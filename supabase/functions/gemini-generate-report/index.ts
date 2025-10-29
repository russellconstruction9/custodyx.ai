import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { GoogleGenAI, Type } from "npm:@google/genai@^1.22.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const reportResponseSchema = {
  type: Type.OBJECT,
  properties: {
    content: {
      type: Type.STRING,
      description: "A detailed, neutral summary of the incident in Markdown format, with specific headings."
    },
    category: {
      type: Type.STRING,
      description: "The single most appropriate category for the incident."
    },
    tags: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING
      },
      description: "An array of 3-5 relevant keywords as tags."
    },
    legalContext: {
      type: Type.STRING,
      description: "An optional, neutral sentence connecting the incident to a principle from Indiana law. Omit if not applicable."
    }
  },
  required: ['content', 'category', 'tags']
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

    const { conversationText, systemInstruction } = await req.json();

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: conversationText,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: reportResponseSchema,
      }
    });

    const jsonText = response.text.trim();
    
    if (!jsonText) {
      throw new Error('Empty response from Gemini');
    }

    const reportData = JSON.parse(jsonText);

    return new Response(
      JSON.stringify({ reportData }),
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

