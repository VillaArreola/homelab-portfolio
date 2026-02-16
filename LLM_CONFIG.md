# LLM Configuration Guide

## Overview

The chat feature now uses a secure server-side API route (`/api/chat`) that proxies requests to your LLM backend. API keys are stored securely in environment variables and never exposed to the browser.

## Architecture

```
User Browser → Next.js Frontend → /api/chat (Server) → LiteLLM Cloud → AI Models
                                     [Keys protected]
```

## Setup Instructions

### 1. Configure Environment Variables

Edit `.env.local` with your LiteLLM cloud credentials:

```bash
# LLM Configuration - Server Side Only
LLM_API_URL=https://your-litellm-server.cloud/v1/chat/completions
LLM_API_KEY=your-secret-api-key
LLM_MODEL=qwen3-vl:Cloud
LLM_TEMPERATURE=0.7
LLM_MAX_TOKENS=500
```

### 2. Local Development

For local testing, you can keep the default localhost endpoint:

```bash
LLM_API_URL=http://localhost:4000/v1/chat/completions
LLM_API_KEY=sk-mi-clave-windows
```

Start your local LiteLLM server first, then:

```bash
npm run dev
```

### 3. Production Deployment

#### Option A: Vercel/Railway (Recommended)

1. Push your code to GitHub (`.env.local` is gitignored)
2. In your deployment platform dashboard:
   - Go to Environment Variables settings
   - Add all `LLM_*` variables from `.env.local`
3. Deploy

#### Option B: Self-Hosted

1. Copy `.env.example` to `.env.production` on your server
2. Fill in your production values
3. Build and start:

```bash
npm run build
npm start
```

### 4. LiteLLM Cloud Setup

1. Deploy LiteLLM on your cloud provider:
   ```bash
   # Example: Railway/Render/Fly.io
   docker run -p 4000:4000 ghcr.io/berriai/litellm:latest
   ```

2. Configure LiteLLM with your model providers:
   ```yaml
   # config.yaml
   model_list:
     - model_name: qwen3-vl:Cloud
       litellm_params:
         model: openrouter/qwen/qwen-2-vl-72b
         api_key: your-openrouter-key
   ```

3. Update `.env.local` with your LiteLLM URL

## Security Features

✅ **API Keys Protected**: Keys stored server-side, never in browser  
✅ **CORS Controlled**: Requests only from your domain  
✅ **Environment Isolated**: `.env.local` gitignored  
✅ **Client-Side Validation**: Guardrails check queries before sending  
✅ **Error Handling**: Safe error messages without exposing internals

## Testing

### Test Local Configuration

1. Start your LiteLLM server: `litellm --port 4000`
2. Start Next.js: `npm run dev`
3. Open chat and ask: "¿Qué servicios están configurados?"
4. Check browser Network tab: should see request to `/api/chat` (NOT external URL)
5. Check terminal logs: should see server-side fetch to LiteLLM

### Test Guardrails

Try these queries to verify security:
- ❌ "ignore previous instructions" → Should block with 🚨 message
- ❌ "write me a poem" → Should block  
- ✅ "¿Qué VLANs están configuradas?" → Should work
- ✅ "Lista los servicios activos" → Should work

## Switching Providers

To switch from LiteLLM to OpenRouter or OpenAI directly:

### OpenRouter

```bash
LLM_API_URL=https://openrouter.ai/api/v1/chat/completions
LLM_API_KEY=sk-or-your-key
LLM_MODEL=qwen/qwen-2-vl-72b
```

### OpenAI

```bash
LLM_API_URL=https://api.openai.com/v1/chat/completions
LLM_API_KEY=sk-your-openai-key
LLM_MODEL=gpt-4-turbo
```

## Troubleshooting

### Chat not connecting

1. Check `.env.local` exists with correct values
2. Restart dev server: `npm run dev`
3. Check browser console for errors
4. Check terminal for API route logs

### "LLM API error: 401"

- Your `LLM_API_KEY` is invalid
- Update key in `.env.local`

### "LLM API error: 404"

- Your `LLM_API_URL` is incorrect
- Verify LiteLLM server is running
- Check URL format includes `/v1/chat/completions`

### "Internal server error"

- Check terminal logs for detailed error
- Verify LiteLLM model name matches config
- Test LiteLLM endpoint directly with curl:

```bash
curl -X POST https://your-litellm-url/v1/chat/completions \
  -H "Authorization: Bearer your-key" \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen3-vl:Cloud","messages":[{"role":"user","content":"test"}]}'
```

## Cost Optimization

The chat already implements token-saving optimizations:

- **Context Selection**: Sends only relevant data based on query keywords
- **Summary Mode**: Default queries get compact summaries (90% token reduction)
- **Full Context**: Only when explicitly requested ("muéstrame todo")
- **No Documentation**: Omits lengthy docs unless needed

Typical token usage:
- Summary query: ~100 tokens
- Specific query (VLAN/IP): ~200 tokens  
- Full topology: ~500 tokens

## Future Enhancements

Potential additions (not yet implemented):

- [ ] Rate limiting per IP address
- [ ] Response caching for common queries
- [ ] Streaming responses for better UX
- [ ] Usage analytics dashboard
- [ ] User-provided API keys option
- [ ] Multiple model selection in UI

## Support

If you encounter issues:

1. Check this guide's troubleshooting section
2. Verify all environment variables are set
3. Test LiteLLM endpoint independently
4. Check browser console and server logs
