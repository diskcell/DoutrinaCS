import { GoogleGenAI, Type } from "@google/genai";
import { BoardData } from "../types";

// Schema de resposta para garantir o JSON correto
const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    chatResponse: { 
      type: Type.STRING, 
      description: "A resposta textual para o usuário. Responda em Português." 
    },
    boardData: {
      type: Type.OBJECT,
      properties: {
        elements: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              type: { type: Type.STRING },
              x: { type: Type.NUMBER },
              y: { type: Type.NUMBER },
              width: { type: Type.NUMBER },
              height: { type: Type.NUMBER },
              title: { type: Type.STRING },
              content: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              status: { type: Type.STRING },
              priority: { type: Type.STRING },
              color: { type: Type.STRING },
              zIndex: { type: Type.NUMBER }
            },
            required: ["id", "type", "x", "y", "width", "height", "content"]
          },
        },
        connections: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              fromId: { type: Type.STRING },
              toId: { type: Type.STRING },
              label: { type: Type.STRING },
              color: { type: Type.STRING },
              style: { type: Type.STRING }
            },
            required: ["id", "fromId", "toId"]
          },
        }
      },
      required: ["elements", "connections"]
    }
  },
  required: ["chatResponse", "boardData"]
};

export const generateBoardLayout = async (
  prompt: string, 
  currentData: BoardData,
  history: { role: 'user' | 'model', parts: { text: string }[] }[] = []
): Promise<{ chatResponse: string; boardData: BoardData }> => {
  
  // 1. CORREÇÃO: Usar import.meta.env para Vite (Navegador)
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error("CRITICAL: API Key is missing. Check your .env file.");
    throw new Error("Chave de API ausente ou não carregada.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `
    Você é o "IntelliBoard AI", um assistente de estratégia.
    Responda em JSON válido seguindo o schema.
    Se o usuário só quiser conversar, devolva arrays vazios em elements e connections.
  `;

  try {
    // 2. CORREÇÃO: Usar um modelo que existe (gemini-1.5-flash)
    const result = await ai.models.generateContent({
      model: "gemini-1.5-flash", 
      contents: [
        ...history,
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.7,
      }
    });

    // 3. Tratamento seguro da resposta
    const responseText = result.text();
    if (!responseText) throw new Error("Resposta vazia da IA");
    
    // Limpeza extra para garantir JSON válido
    const cleanJson = responseText.replace(/```json|```/g, '').trim();
    
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Erro detalhado na API Gemini:", error);
    throw error;
  }
};