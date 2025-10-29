import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { GoogleGenAI, Part, Content } from "npm:@google/genai@^1.22.0";

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

    const { messages, systemInstruction } = await req.json();

    const ai = new GoogleGenAI({ apiKey });

    const contents: Content[] = messages.map((msg: any) => {
      const parts: Part[] = [{ text: msg.content }];
      if (msg.images) {
        msg.images.forEach((image: any) => {
          parts.push({
            inlineData: {
              mimeType: image.mimeType,
              data: image.data,
            },
          });
        });
      }
      return {
        role: msg.role,
        parts,
      };
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return new Response(
      JSON.stringify({ text: response.text }),
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

