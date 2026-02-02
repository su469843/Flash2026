
import { GoogleGenAI, Type } from "@google/genai";
import { WishResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const generateNewYearWish = async (prompt: string): Promise<WishResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `User request: "${prompt}". 
      Generate a poetic and inspiring New Year message. Adhere strictly to the requested language in the prompt.
      Also provide a matching visual theme name and 3-5 hex colors that match this specific vibe for fireworks.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING },
            theme: { type: Type.STRING },
            colors: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["message", "theme", "colors"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      message: "May the light of the new year bring you joy and prosperity! ✨",
      theme: "Classic Celebration",
      colors: ["#ff0000", "#ffd700", "#ffffff", "#ff4500"]
    };
  }
};
