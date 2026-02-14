import { WishResponse } from "./types";

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'anthropic/claude-3-haiku-20240307';

export const generateNewYearWish = async (prompt: string, language?: 'zh' | 'en'): Promise<WishResponse> => {
  const lang = language || (prompt.includes('(Reply in Chinese)') ? 'zh' : 'en');
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  const model = import.meta.env.VITE_OPENROUTER_MODEL || DEFAULT_MODEL;

  // If no API key configured, return fallback immediately
  if (!apiKey || apiKey === 'YOUR_OPENROUTER_API_KEY_HERE') {
    console.warn('OpenRouter API key not configured, using fallback response');
    return getFallbackResponse(lang);
  }

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
        'X-Title': 'Lunar Glow 2025'
      },
      body: JSON.stringify({
        model: model,
        messages: [{
          role: 'user',
          content: `User request: "${prompt}".
          Generate a poetic and inspiring New Year message. Adhere strictly to the requested language in the prompt.
          Also provide a matching visual theme name and 3-5 hex colors that match this specific vibe for fireworks.
          
          Return ONLY a JSON object with this exact structure:
          {
            "message": "Your inspiring message here (in ${lang === 'zh' ? 'Chinese' : 'English'})",
            "theme": "Theme name (in ${lang === 'zh' ? 'Chinese' : 'English'})",
            "colors": ["#ff0000", "#ffd700", "#ffffff", "#ff4500", "#00ff00"]
          }
          
          The message should be 2-4 sentences, inspirational and poetic.
          The theme should be a short descriptive name.
          Provide 4-5 hex colors that match the theme and vibe.`
        }],
        temperature: 0.8,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response content from OpenRouter API');
    }

    // Parse the JSON response (handle markdown code blocks)
    const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleanContent);
    
    // Validate the response structure
    if (!parsed.message || !parsed.theme || !parsed.colors || !Array.isArray(parsed.colors)) {
      throw new Error('Invalid response structure from AI');
    }
    
    return parsed as WishResponse;
  } catch (error) {
    console.error('Error calling OpenRouter API:', error);
    return getFallbackResponse(lang);
  }
};

function getFallbackResponse(language: 'zh' | 'en'): WishResponse {
  if (language === 'zh') {
    return {
      message: "愿新年的光芒为你带来喜悦与繁荣！✨",
      theme: "经典庆典",
      colors: ["#ff0000", "#ffd700", "#ffffff", "#ff4500"]
    };
  } else {
    return {
      message: "May the light of the new year bring you joy and prosperity! ✨",
      theme: "Classic Celebration",
      colors: ["#ff0000", "#ffd700", "#ffffff", "#ff4500"]
    };
  }
}
