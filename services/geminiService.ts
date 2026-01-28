import { GoogleGenAI, Type } from "@google/genai";
import { BoardData } from "../types";

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
  
  // CORREÇÃO: Usar import.meta.env (padrão Vite) ou fallback seguro
  // Isso evita o erro "process is not defined" no navegador
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyAFiimHjmDHb16-L-Gkqf-G0uMVJw74Rwc"; // Sua chave

  if (!apiKey) {
    console.error("ERRO CRÍTICO: Chave de API não encontrada.");
    throw new Error("Chave de API ausente");
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `
    Você é o "IntelliBoard AI". 
    Responda SEMPRE com um JSON válido seguindo o schema fornecido.
    Se o usuário apenas conversar, retorne arrays vazios em 'elements' e 'connections'.
  `;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-1.5-flash", // Use 1.5-flash que é estável
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

    const responseText = result.text();
    if (!responseText) throw new Error("A IA retornou uma resposta vazia.");
    
    // Limpeza de segurança para JSON
    const cleanJson = responseText.replace(/```json|```/g, '').trim();

    return JSON.parse(cleanJson);

  } catch (error) {
    console.error("ERRO DETALHADO DO GEMINI:", error);
    throw error;
  }
};