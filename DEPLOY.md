# Deployment Guide

## Quick Deploy to Vercel

### Prerequisites
1. Get an OpenRouter API key from https://openrouter.ai/keys
2. Have your code ready in a Git repository or local folder

### Method 1: Vercel CLI (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

4. **Set Environment Variable**:
   During deployment, when prompted, add:
   - Name: `OPENROUTER_API_KEY`
   - Value: Your OpenRouter API key

   Or set it after deployment:
   ```bash
   vercel env add OPENROUTER_API_KEY production
   ```

### Method 2: Vercel Dashboard

1. Go to https://vercel.com/new
2. Connect your Git repository
3. Configure project settings:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add Environment Variable:
   - Key: `OPENROUTER_API_KEY`
   - Value: Your OpenRouter API key
5. Click Deploy

### Method 3: Local Build + Deploy

1. **Set environment variable**:
   ```bash
   export OPENROUTER_API_KEY="your_api_key_here"
   ```

2. **Build locally**:
   ```bash
   npm run build
   ```

3. **Deploy with Vercel**:
   ```bash
   vercel --prod
   ```

## Post-Deployment Verification

1. Open your deployed app URL
2. Enter a wish/message in the input field
3. Click "Ignite My Celebration"
4. You should see:
   - AI-generated message
   - Fireworks with matching colors
   - Text in the selected language

## Troubleshooting

### Build Failures
- Ensure all dependencies are installed: `npm install`
- Check TypeScript errors: `npx tsc --noEmit`
- Verify environment variables are set

### API Errors
- Check OpenRouter API key is valid
- Verify you have sufficient credits in OpenRouter
- Check Vercel function logs: `vercel logs`

### CORS Issues
- The backend API automatically handles CORS
- Ensure `vercel.json` is properly configured

## Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `OPENROUTER_API_KEY` | OpenRouter API key | Yes | None |
| `OPENROUTER_MODEL` | AI model to use (see available models at openrouter.ai/docs#models) | No | `anthropic/claude-3-haiku-20240307` |
| `VITE_API_URL` | API endpoint URL | No | `/api/wish` |

### Available Models
You can use any model from OpenRouter's model list. Popular options:
- `anthropic/claude-3-haiku-20240307` - Fast, economical (default)
- `anthropic/claude-3.5-sonnet-20241022` - More capable, slightly more expensive
- `openai/gpt-4o-mini` - OpenAI's efficient model
- `google/gemini-pro` - Google's Gemini model
- `meta-llama/llama-3.1-8b-instruct` - Open source option

See the full list at: https://openrouter.ai/docs#models

## Costs

- **Vercel**: Free tier includes 500,000 serverless function invocations/month
- **OpenRouter**: Costs vary by model usage (Claude Haiku is economical)

## Architecture Overview

```
┌─────────────┐
│   Browser   │
│  (React App)│
└──────┬──────┘
       │ POST /api/wish
       ▼
┌─────────────────────┐
│ Vercel Serverless   │
│ Function (api/wish) │
└──────┬──────────────┘
       │ POST with API Key
       ▼
┌─────────────────────┐
│   OpenRouter API    │
│ (Claude 3 Haiku)    │
└─────────────────────┘
```

This architecture ensures:
- API keys remain secure on the backend
- Frontend only makes requests to your own API
- Scalable serverless deployment