import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export type StudyMode = 'solve' | 'notes' | 'examples';

export interface StudyResponse {
  content: string;
  mode: StudyMode;
}

export async function getStudyBuddyResponse(input: string, mode: StudyMode): Promise<string> {
  const model = "gemini-3.1-pro-preview";
  
  let systemInstruction = "";
  
  switch (mode) {
    case 'solve':
      systemInstruction = "You are an expert tutor. Solve the user's question step-by-step. Provide clear explanations for each step. If it's a math problem, show the formulas. If it's a conceptual question, provide a logical breakdown.";
      break;
    case 'notes':
      systemInstruction = "You are a master of summarization. Create concise, high-quality study notes for the given topic. Use bullet points, bold text for key terms, and organize information logically. Focus on the most important concepts.";
      break;
    case 'examples':
      systemInstruction = "You are an illustrative teacher. Provide 3-5 diverse and clear examples related to the user's topic or question. Explain why each example is relevant and how it demonstrates the concept.";
      break;
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: input }] }],
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "I'm sorry, I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "An error occurred while connecting to the AI. Please check your connection and try again.";
  }
}
