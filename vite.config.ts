import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { IncomingMessage, ServerResponse } from 'http';

// Helper for fallback response
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

// Custom API middleware plugin
const apiMiddleware = (env: Record<string, string>) => ({
  name: 'api-middleware',
  configureServer(server: any) {
    server.middlewares.use('/api/wish', async (req: IncomingMessage, res: ServerResponse, next: any) => {
      if (req.method !== 'POST') {
        next();
        return;
      }

      let language: 'zh' | 'en' = 'en';

      try {
        const buffers = [];
        for await (const chunk of req) {
          buffers.push(chunk);
        }
        
        const rawBody = Buffer.concat(buffers).toString();
        if (!rawBody) {
             res.statusCode = 400;
             res.end(JSON.stringify({ error: 'Missing body' }));
             return;
        }

        const body = JSON.parse(rawBody);
        if (body.language) language = body.language;
        
        const { prompt } = body;

        if (!prompt) {
           res.statusCode = 400;
           res.setHeader('Content-Type', 'application/json');
           res.end(JSON.stringify({ error: 'Missing required field: prompt' }));
           return;
        }

        const apiKey = env.OPENROUTER_API_KEY || env.VITE_OPENROUTER_API_KEY;

        if (!apiKey || apiKey === 'YOUR_OPENROUTER_API_KEY_HERE') {
            console.warn('API key not configured, using fallback');
             // Simulate success with fallback
             res.setHeader('Content-Type', 'application/json');
             res.end(JSON.stringify(getFallbackResponse(language)));
             return;
        }
        
        const model = env.OPENROUTER_MODEL || 'anthropic/claude-3-haiku-20240307';
        
        // Use global fetch (Node 18+)
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
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

        const data: any = await response.json();
        const content = data.choices[0]?.message?.content;
        
        if (!content) {
          throw new Error('No response content from OpenRouter API');
        }

        const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleanContent);
        
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(parsed));

      } catch (error) {
        console.error('API Error:', error);
        res.setHeader('Content-Type', 'application/json');
        // Return fallback on error, treating it as a success for the UI
        res.end(JSON.stringify(getFallbackResponse(language)));
      }
    });
  }
});

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        apiMiddleware(env)
      ],
      define: {
        'process.env': {}
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
