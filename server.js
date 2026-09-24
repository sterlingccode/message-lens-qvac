import express from 'express';
import { loadModel, LLAMA_3_2_1B_INST_Q4_0, completion } from '@qvac/sdk';

const app = express();
const PORT = process.env.PORT || 3000;
const MODEL = LLAMA_3_2_1B_INST_Q4_0;

app.use(express.json({ limit: '64kb' }));
app.use(express.static('public'));

let modelId = null;
let loadingPromise = null;

async function ensureModel() {
  if (modelId) return modelId;
  if (!loadingPromise) {
    console.log('Loading QVAC model. The first run may download the model...');
    loadingPromise = loadModel({
      modelSrc: MODEL,
      onProgress: (p) => {
        if (Number.isFinite(p?.percentage)) {
          process.stdout.write(`\rQVAC model: ${p.percentage.toFixed(0)}%`);
          if (p.percentage >= 100) process.stdout.write('\n');
        }
      }
    }).then((id) => {
      modelId = id;
      console.log('QVAC model ready.');
      return id;
    });
  }
  return loadingPromise;
}

function extractJson(text) {
  const cleaned = text.trim().replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch {}
    }
  }
  return {
    intent: 'Could not reliably classify',
    urgency: 'unknown',
    tone: 'unknown',
    summary: cleaned,
    reply: 'Write a reply based on the message and your own context.'
  };
}

app.get('/api/status', (_req, res) => {
  res.json({ ready: Boolean(modelId) });
});

app.post('/api/analyze', async (req, res) => {
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';

  if (!message) return res.status(400).json({ error: 'Paste a message first.' });
  if (message.length > 5000) return res.status(400).json({ error: 'Please keep the message under 5,000 characters.' });

  try {
    const id = await ensureModel();
    const history = [
      {
        role: 'system',
        content:
          'You are MessageLens, a private message-reading assistant. Analyze the user-provided message only. Return ONLY valid JSON with exactly these keys: intent, urgency, tone, summary, reply. urgency must be one of low, medium, high. summary must be one short sentence. reply must be a natural, polite reply of 1-3 sentences. Do not invent facts that are not present in the message.'
      },
      {
        role: 'user',
        content: `Analyze this message:\n\n${message}`
      }
    ];

    const run = completion({ modelId: id, history, stream: true });
    let output = '';
    for await (const token of run.tokenStream) output += token;

    res.json(extractJson(output));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error?.message || 'QVAC could not analyze the message.' });
  }
});

app.listen(PORT, () => {
  console.log(`MessageLens running at http://localhost:${PORT}`);
});
