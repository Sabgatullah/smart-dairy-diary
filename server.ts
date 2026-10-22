import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini SDK with User-Agent header
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    appName: 'Smart Dairy Diary',
    hasGeminiKey: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
});

// Gemini Veterinary & Dairy Farming Intelligence Endpoint
app.post('/api/gemini/advisor', async (req: Request, res: Response) => {
  try {
    const { prompt, context } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt in request body' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API is not configured on the server. Please verify GEMINI_API_KEY.',
      });
    }

    const systemInstruction = `You are "Dr. Dairy" — an expert veterinary consultant and precision dairy management specialist tailored specifically for Pakistani dairy farms (Punjab, Sindh, KPK, Balochistan).
You have deep expertise in:
1. Breeds: Nili-Ravi buffaloes, Kundi buffaloes, Sahiwal cows, Cholistani cows, Red Sindhi, Australian/Friesian-Jersey crossbreds.
2. Local Feeds: Green fodder (Barseem, Maize, Sorghum/Jowar, Rhodes grass, Alfa-alfa), dry fodder (Wheat straw / Toori), concentrates / Wanda (Punjab Dairy Wanda, Cottonseed cake / Khal, Mustard cake, Choker / Wheat bran, Molasses, bypass fats, mineral mixtures).
3. Common Diseases: Subclinical & clinical Mastitis (Saaroo), Hemorrhagic Septicemia (HS / Gal Ghotu), Foot and Mouth Disease (FMD / Munh-Khur), Lumpy Skin Disease (LSD), Theileriosis / Tick Fever, Milk Fever (Hypocalcemia), Ketosis, Bloat.
4. Reproduction: Artificial Insemination (AI), estrus detection (silent heat vs visible heat), gestation periods (283 days for cows, 310-315 days for buffaloes), dry cow management (60-day dry off period).
5. Milk Economics: In Pakistani Rupees (PKR), calculating feed cost per liter of milk, profitability margins, and milk fat percentage management.

Guidelines:
- Provide clear, actionable, structured, highly professional advice with bullet points and bold section headers.
- Include local Pakistani dairy terminology (e.g., Toori, Wanda, Barseem, Khal, Saaroo, Munh-Khur) alongside standard veterinary terminology.
- When an animal shows acute or emergency symptoms, always emphasize consulting a qualified local field veterinarian (DVM).
- Farm context provided by user: ${JSON.stringify(context || {})}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const text = response.text || 'No response generated.';
    return res.json({ advice: text });
  } catch (err: any) {
    console.error('Error in /api/gemini/advisor:', err);
    return res.status(500).json({
      error: err.message || 'Failed to generate advisory response.',
    });
  }
});

// Gemini Anomaly & Symptom Analyzer
app.post('/api/gemini/diagnose', async (req: Request, res: Response) => {
  try {
    const { animal, recentMilkLogs, symptoms } = req.body;

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API is not configured on the server.',
      });
    }

    const systemInstruction = `You are a clinical veterinary diagnostic assistant for dairy animals (cows and buffaloes in Pakistan).
Analyze the animal profile, recent milk yield trajectory, and observed symptoms.
Provide:
1. Probable causes ranked by likelihood (e.g. Subclinical mastitis, nutritional deficiency, heat stress, estrus, subclinical ketosis).
2. Immediate farm-level actions (e.g., California Mastitis Test CMT, rectal temperature check, feed adjustment, isolation).
3. Recommended veterinary medications or supplements commonly used in Pakistan (broad spectrum antibiotics if mastitis, anti-inflammatory like Meloxicam, electrolyte/dextrose therapy, mineral chelates). Note withdrawal periods for milk sale!
4. Prevention tips.
Be succinct, structured, and clinically sound.`;

    const promptText = `Animal Profile:
- Tag/ID: ${animal?.tag || 'Unknown'} (${animal?.name || 'Unnamed'})
- Species: ${animal?.species} (${animal?.breed})
- Lactation: ${animal?.lactationNumber || 1}, Status: ${animal?.status}
- Recent Milk History: ${JSON.stringify(recentMilkLogs || [])}
- Reported Signs/Symptoms: ${symptoms || 'Sudden unexplained drop in milk yield'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction,
        temperature: 0.5,
      },
    });

    return res.json({ diagnosis: response.text || 'No diagnosis available.' });
  } catch (err: any) {
    console.error('Error in /api/gemini/diagnose:', err);
    return res.status(500).json({
      error: err.message || 'Failed to diagnose symptoms.',
    });
  }
});

async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Smart Dairy Diary server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
