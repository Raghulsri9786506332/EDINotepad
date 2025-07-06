// EDI AI Summary Backend (Node.js + Express + OpenAI)
// Place this file at the root of your React project and run with: node edi-ai-backend.js

import express from 'express';
import cors from 'cors';
import axios from 'axios';
import OpenAI from 'openai';

const app = express();
app.use(cors());
app.use(express.json());

// Chat endpoint
app.post('/api/:provider/chat', async (req, res) => {
  const { provider } = req.params;
  const { prompt } = req.body;
  const apiKey = req.headers['x-api-key'] || req.body.apiKey;
  if (!prompt || !provider || !apiKey) return res.status(400).json({ error: 'Missing prompt, provider, or apiKey' });

  try {
    let text = '';
    if (provider === 'gemini') {
      // Updated for Gemini 2.5 Flash REST API
      // Docs: https://ai.google.dev/gemini-api/docs/get-started-rest
      const gemRes = await axios.post(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        { contents: [{ parts: [{ text: prompt }] }] }
      );
      text = gemRes.data.candidates[0]?.content?.parts[0]?.text || 'No response';
    } else if (provider === 'openai') {
      const openai = new OpenAI({ apiKey });
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 600
      });
      text = completion.choices[0].message.content;
    } else {
      return res.status(400).json({ error: 'Unknown provider' });
    }
    res.json({ text });
  } catch (err) {
    if (err.response) {
      console.error('AI provider error:', err.response.status, err.response.data);
      res.status(500).json({ error: 'AI provider error', detail: err.response.data?.error?.message || JSON.stringify(err.response.data) || err.message });
    } else {
      console.error('AI provider error:', err);
      res.status(500).json({ error: 'AI provider error', detail: err.message });
    }
  }
});

// Existing summary endpoint
app.post('/api/edi/summary', async (req, res) => {
  const { content, provider, apiKey } = req.body;
  if (!content || !provider || !apiKey) return res.status(400).json({ error: 'Missing content, provider, or apiKey' });

  try {
    // DEBUG: Log incoming request
    console.log('AI summary request:', { provider, hasApiKey: !!apiKey, contentLength: content?.length });
    let summary = '';
    const prompt = `You are a helpful business analyst. A colleague who has NO EDI knowledge needs to understand the following raw EDI X12 file. 

Please write a short, easy-to-understand briefing that:
• Starts with one plain-English sentence saying what this document is and why it matters.
• Lists the key facts in simple bullets: who sent it, who will receive the goods, when it was sent, what is being shipped, how many units, where it is going, important dates, reference numbers (PO, invoice, tracking, etc.).
• Avoids any EDI jargon or segment codes—no “ST”, “BSN”, “HL” codes, no technical language.
• Uses everyday words (e.g., say “tracking number” instead of “PRO number”).
• Keeps it concise (≈150 words).

Here is the raw EDI text:
${content}
`;

    if (provider === 'openai') {
      const openai = new OpenAI({ apiKey });
      const completion = await openai.createChatCompletion({
        model: "gpt-4", // or "gpt-3.5-turbo"
        messages: [{ role: "user", content: prompt }],
        max_tokens: 600,
        temperature: 0.2,
      });
      summary = completion.data.choices[0].message.content;
    } else if (provider === 'gemini') {
      // Updated for Gemini 2.5 Flash REST API (summary)
      const geminiRes = await axios.post(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }]
        }
      );
      summary = geminiRes.data.candidates[0]?.content?.parts[0]?.text || 'No summary returned';
    } else if (provider === 'claude') {
      // Claude (Anthropic) API example
      // Docs: https://docs.anthropic.com/claude/reference/messages_post
      const claudeRes = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: 'claude-3-opus-20240229',
          max_tokens: 600,
          temperature: 0.2,
          messages: [{ role: 'user', content: prompt }]
        },
        {
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          }
        }
      );
      summary = claudeRes.data.content[0]?.text || 'No summary returned';
    } else if (provider === 'deepseek') {
      // DeepSeek API example
      // Docs: https://platform.deepseek.com/docs
      const dsRes = await axios.post(
        'https://api.deepseek.com/v1/chat/completions',
        {
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 600,
          temperature: 0.2,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          }
        }
      );
      summary = dsRes.data.choices[0]?.message?.content || 'No summary returned';
    } else {
      return res.status(400).json({ error: 'Unknown provider' });
    }
    res.json({ summary });
  } catch (err) {
    // Improved error logging
    if (err.response) {
      // API error from provider
      console.error('AI provider error:', err.response.status, err.response.data);
      res.status(500).json({
        error: 'AI provider error',
        detail: err.response.data?.error?.message || JSON.stringify(err.response.data) || err.message
      });
    } else {
      // Other error
      console.error('AI provider error:', err);
      res.status(500).json({ error: 'AI provider error', detail: err.message });
    }
  }
});

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`AI backend running on http://localhost:${PORT}`);
});
