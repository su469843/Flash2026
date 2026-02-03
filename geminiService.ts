
import { WishResponse } from "./types";

const API_URL = import.meta.env.VITE_API_URL || '/api/wish';

export const generateNewYearWish = async (prompt: string): Promise<WishResponse> => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        language: prompt.includes('(Reply in Chinese)') ? 'zh' : 'en'
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Error:", error);
    const isZh = prompt.includes('(Reply in Chinese)');
    return {
      message: isZh 
        ? "愿新年的光芒为你带来喜悦与繁荣！✨" 
        : "May the light of the new year bring you joy and prosperity! ✨",
      theme: isZh ? "经典庆典" : "Classic Celebration",
      colors: ["#ff0000", "#ffd700", "#ffffff", "#ff4500"]
    };
  }
};
