<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Lunar Glow 2025 - Interactive Fireworks App

This is a React 19 + TypeScript app with a canvas-based fireworks display that responds to AI-generated wishes using OpenRouter API.

## Features

- **Interactive Fireworks**: Click anywhere on the canvas to launch fireworks
- **AI-Powered Wishes**: Generate poetic New Year messages using OpenRouter API
- **Multiple Firework Types**: Peony, Cross, Meteor, and Random patterns
- **Bilingual Support**: English and Chinese language support
- **Backend API**: Secure API calls through Vercel Serverless Functions

## Technology Stack

- React 19 + TypeScript
- Vite (Build tool)
- Canvas API (Fireworks rendering)
- OpenRouter AI API (Backend)
- Vercel (Deployment)

## Run Locally

**Prerequisites:** Node.js (v18+), npm

1. **Get OpenRouter API Key**:
   - Sign up at [OpenRouter](https://openrouter.ai/)
   - Create an API key at https://openrouter.ai/keys

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   - Copy `.env.local` and add your OpenRouter API key:
   ```bash
   OPENROUTER_API_KEY=your_api_key_here
   ```

4. **Run in development mode**:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`

## Deploy to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/your-repo-name&env=OPENROUTER_API_KEY)

### Manual Deploy

1. **Install Vercel CLI** (if not already installed):
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

   During deployment, you'll be prompted to:
   - Set the `OPENROUTER_API_KEY` environment variable
   - Configure other settings (accept defaults for most)

4. **Environment Variables**:
   Make sure to set these in your Vercel project settings:
   - `OPENROUTER_API_KEY`: Your OpenRouter API key
   - `VITE_API_URL`: `/api/wish` (automatically set by Vercel)

### Deploy from Git

1. Push your code to GitHub/GitLab
2. Connect your repository to Vercel at https://vercel.com/new
3. Add the `OPENROUTER_API_KEY` environment variable
4. Deploy!

## API Architecture

- **Frontend**: React app makes POST requests to `/api/wish`
- **Backend**: Vercel Serverless Function (`api/wish.ts`) securely calls OpenRouter API
- **Security**: API keys are never exposed to the client-side

## Configuration

### Vercel Configuration

The `vercel.json` file configures:
- Build process for both frontend and backend
- API route handling
- Environment variable injection

### Environment Variables

- `OPENROUTER_API_KEY`: Required for AI functionality
- `VITE_API_URL`: Optional, defaults to `/api/wish` in production

## Troubleshooting

### Common Issues

1. **API Key Errors**:
   - Ensure `OPENROUTER_API_KEY` is set in your environment
   - Check that you have sufficient credits in OpenRouter

2. **Build Failures**:
   - Ensure all dependencies are installed: `npm install`
   - Check that TypeScript compilation succeeds: `npm run build`

3. **CORS Issues**:
   - The backend API automatically sets CORS headers
   - In development, requests are proxied through Vercel

### Local Development with API

To test the API locally:

1. Install Vercel CLI: `npm i -g vercel`
2. Link your project: `vercel link`
3. Pull environment variables: `vercel env pull`
4. Run locally: `vercel dev`

This will start both the frontend and backend locally.
