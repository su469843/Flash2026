import type { VercelRequest, VercelResponse } from '@vercel/node';

interface WishRequest {
  prompt: string;
  language: 'zh' | 'en';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt, language } = req.body as WishRequest;
  
  if (!prompt || !language) {
    return res.status(400).json({ error: 'Missing required fields: prompt and language' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ 
      error: 'API key not configured',
      fallback: getFallbackResponse(language)
    });
  }

  try {
    const model = process.env.OPENROUTER_MODEL || 'anthropic/claude-3-haiku-20240307';
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000',
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
            "message": "Your inspiring message here (in ${language === 'zh' ? 'Chinese' : 'English'})",
            "theme": "Theme name (in ${language === 'zh' ? 'Chinese' : 'English'})",
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

    // Try to parse the JSON response
    try {
      // The content might be wrapped in markdown code blocks
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanContent);
      
      // Validate the response structure
      if (!parsed.message || !parsed.theme || !parsed.colors || !Array.isArray(parsed.colors)) {
        throw new Error('Invalid response structure from AI');
      }
      
      return res.status(200).json(parsed);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      console.error('Parse error:', parseError);
      throw new Error('Failed to parse AI response as JSON');
    }

  } catch (error) {
    console.error('Error calling OpenRouter API:', error);
    
    // Return fallback response
    return res.status(200).json(getFallbackResponse(language));
  }
}

function getFallbackResponse(language: 'zh' | 'en') {
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