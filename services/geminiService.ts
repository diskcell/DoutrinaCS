
import { GoogleGenAI, Type } from "@google/genai";
import { BoardData } from "../types";

// Esquema mantido
const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    chatResponse: { 
      type: Type.STRING, 
      description: "A resposta textual para o usuário. Deve ser o foco principal em conversas exploratórias." 
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
          description: "Lista de novos elementos. Deixe vazio se estiver apenas conversando."
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
          description: "Lista de conexões. Deixe vazio se estiver apenas conversando."
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
  
  // Debug para ajudar o usuário localmente
  if (!process.env.API_KEY) {
    console.error("CRITICAL: API Key is missing or empty. Please check your .env file.");
    throw new Error("API Key not found in environment variables");
  }

  const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY
});
  const systemInstruction = `
    Você é o "IntelliBoard AI", um consultor de estratégia e criatividade. 
    
    DIRETRIZ DE COMPORTAMENTO:
    1. ANALISE A INTENÇÃO: O usuário quer APENAS CONVERSAR ou quer ORGANIZAR O QUADRO?
       - Se o usuário fizer uma pergunta genérica (ex: "O que você acha de marketing?"), responda apenas no 'chatResponse'. Deixe 'elements' e 'connections' VAZIOS.
       - Se o usuário pedir para planejar, estruturar ou criar algo visual (ex: "Monte um plano de estudo"), então preencha o 'boardData'.
    
    2. SEJA EDUCADO E HUMANO: 
       - Não despeje cartões no quadro sem necessidade. 
       - Em conversas longas, ofereça: "Se quiser, posso transformar esse planejamento em cards no seu whiteboard. Deseja fazer isso agora?".
    
    3. QUALIDADE SOBRE QUANTIDADE:
       - Ao criar cartões, use títulos curtos e descrições úteis.
       - Conecte as ideias logicamente para criar um fluxo de pensamento.

    REGRAS TÉCNICAS:
    - Responda SEMPRE em Português do Brasil.
    - O 'chatResponse' deve ser amigável e natural, sem formatação Markdown excessiva.
    - Se não for criar nada no quadro, retorne: "boardData": {"elements": [], "connections": []}.
  `;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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

    const responseText = result.text;
    if (!responseText) throw new Error("Resposta vazia da IA");
    
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Erro detalhado no serviço Gemini:", error);
    // Re-throw para o componente pegar
    throw error;
  }
};
