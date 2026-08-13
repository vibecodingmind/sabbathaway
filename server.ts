import 'dotenv/config';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer as createViteServer } from 'vite';
import { createApiRouter } from './server/routes.js';
import { stripeWebhookHandler } from './server/stripeWebhook.js';
import { uploadsAbsoluteDir } from './server/uploads.js';
import { isStripeConfigured } from './server/payments.js';
import { isPostgresUrl, resolveDatabaseUrl } from './server/db.js';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.set('trust proxy', 1);
  app.use(
    helmet({
      contentSecurityPolicy: false, // SPA + Vite inline scripts in dev
      crossOriginEmbedderPolicy: false,
    })
  );
  app.use(cors({ origin: true, credentials: true }));

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isProd ? 400 : 2000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests — please try again shortly.' },
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isProd ? 40 : 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many auth attempts — please wait and try again.' },
  });

  // Stripe webhook needs the raw body for signature verification
  app.post(
    '/api/payments/stripe/webhook',
    express.raw({ type: 'application/json' }),
    stripeWebhookHandler
  );

  app.use(express.json({ limit: '2mb' }));
  app.use(cookieParser());
  app.use('/uploads', express.static(uploadsAbsoluteDir()));
  app.use('/api/', apiLimiter);
  app.use('/api/auth/', authLimiter);

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'HEALTHY',
      service: 'AdventistStay API Engine',
      timestamp: new Date().toISOString(),
      version: '1.3.0',
      persistence: isPostgresUrl() ? 'postgresql+prisma' : 'sqlite+prisma',
      database: isPostgresUrl(resolveDatabaseUrl()) ? 'postgres' : 'sqlite',
      integrations: {
        stripe: isStripeConfigured() ? 'checkout_enabled' : 'simulated',
        email: process.env.RESEND_API_KEY
          ? 'resend'
          : process.env.SMTP_HOST
            ? 'smtp'
            : 'logged_only',
        maps: Boolean(process.env.GOOGLE_MAPS_PLATFORM_KEY) ? 'google' : 'vector_fallback',
      },
      compliance: {
        nonCommercialHospitality: true,
        verificationTierSupport: true,
        zeroAccommodationFees: true,
      },
    });
  });

  app.get('/api/docs/openapi', (_req, res) => {
    res.json({
      openapi: '3.0.3',
      info: {
        title: 'AdventistStay Hospitality Platform API',
        description:
          'RESTful API for Seventh-day Adventist global Christian hospitality, church verifications, memberships, and stay requests.',
        version: '1.3.0',
        contact: {
          name: 'AdventistStay Engineering Team',
          email: 'support@adventiststay.org',
        },
      },
      servers: [{ url: '/api', description: 'Current environment' }],
      paths: {
        '/auth/register': { post: { summary: 'Register member with optional membership plan' } },
        '/auth/login': { post: { summary: 'Email/password login' } },
        '/bootstrap': { get: { summary: 'Hydrate client app state from database' } },
        '/listings': { get: { summary: 'Search host listings' }, post: { summary: 'Create listing' } },
        '/stays': { get: { summary: 'List stay requests' }, post: { summary: 'Create stay request' } },
        '/verifications': {
          get: { summary: 'Verification queue' },
          post: { summary: 'Submit verification (multipart document optional)' },
        },
        '/memberships/subscribe': {
          post: { summary: 'Purchase membership (Stripe Checkout when configured)' },
        },
        '/payments/stripe/webhook': { post: { summary: 'Stripe Checkout webhook' } },
        '/ai/assistant': { post: { summary: 'Gemini Sabbath concierge' } },
      },
    });
  });

  app.use('/api', createApiRouter());

  app.post('/api/ai/assistant', async (req, res) => {
    try {
      const { action, prompt, context } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        if (action === 'ITINERARY') {
          return res.json({
            text: `### Sample Sabbath Itinerary for ${context?.destination || 'Your Destination'}

**Friday Evening (Sunset)**
- Welcome sunset worship with host family, candle lighting, and scripture reading.
- Warm Sabbath eve supper (plant-based).

**Saturday (Sabbath Day)**
- Sabbath School & Divine Worship at the local Seventh-day Adventist Church.
- Fellowship lunch and afternoon nature rest.
- Sunset vespers prayer.`,
          });
        }

        return res.json({
          text: `I am your AdventistStay AI Sabbath Concierge. I can help with dietary matches, church proximity, fellowship preferences, and Sabbath itineraries. How can I assist your travels today?`,
        });
      }

      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'adventiststay' } },
      });

      let systemInstruction =
        'You are the AdventistStay AI Sabbath Assistant—a warm, respectful, knowledgeable Christian concierge for the global Seventh-day Adventist travel and stay community. Focus on Sabbath peace, vegetarian/vegan meal hospitality, local church fellowship, family safety, and Christian hospitality values.';

      if (action === 'ITINERARY') {
        systemInstruction +=
          ' Focus on creating a restful Friday sunset to Saturday sunset itinerary including local SDA church attendance, potluck fellowship, and nature reflection.';
      } else if (action === 'LISTING_ASSISTANT') {
        systemInstruction +=
          ' Help hosts write a warm Christian host bio and Sabbath house rules.';
      }

      const userPrompt =
        prompt ||
        `Help me plan a blessed Sabbath stay at ${context?.destination || 'my destination'}.`;

      const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
        contents: userPrompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      return res.json({
        text:
          response.text ||
          'May your stay be filled with Sabbath peace and Christian fellowship!',
      });
    } catch (err: any) {
      console.error('AI Assistant Error:', err);
      return res.status(500).json({
        error: 'Failed to process AI assistant request',
        details: err?.message || 'Unknown error',
      });
    }
  });

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AdventistStay Server running on http://0.0.0.0:${PORT}`);
    console.log(
      `Database: ${isPostgresUrl() ? 'PostgreSQL' : 'SQLite'} | Stripe: ${
        isStripeConfigured() ? 'Checkout' : 'simulated'
      }`
    );
  });
}

startServer().catch((err) => {
  console.error('Failed to start AdventistStay server:', err);
  process.exit(1);
});
