import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory data endpoints powering the REST API
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'HEALTHY',
      service: 'AdventistStay API Engine',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      compliance: {
        nonCommercialHospitality: true,
        verificationTierSupport: true,
        zeroAccommodationFees: true
      }
    });
  });

  // OpenAPI 3.0 Documentation Endpoint
  app.get('/api/docs/openapi', (req, res) => {
    res.json({
      openapi: '3.0.3',
      info: {
        title: 'AdventistStay Hospitality Platform API',
        description: 'RESTful API standard for Seventh-day Adventist global Christian hospitality network, church verifications, and stay requests.',
        version: '1.0.0',
        contact: {
          name: 'AdventistStay Engineering Team',
          email: 'support@adventiststay.org'
        }
      },
      servers: [
        { url: '/api', description: 'Current Cloud Run Environment' }
      ],
      paths: {
        '/listings': {
          get: {
            summary: 'Search and filter active SDA host listings',
            parameters: [
              { name: 'city', in: 'query', schema: { type: 'string' } },
              { name: 'purpose', in: 'query', schema: { type: 'string' } },
              { name: 'guests', in: 'query', schema: { type: 'integer' } }
            ],
            responses: {
              '200': { description: 'List of matching verified host listings' }
            }
          },
          post: {
            summary: 'Create a new host listing (Host / Admin only)',
            responses: {
              '201': { description: 'Listing successfully published' }
            }
          }
        },
        '/churches': {
          get: {
            summary: 'Query global SDA Church Directory',
            responses: {
              '200': { description: 'Official list of registered SDA local churches' }
            }
          }
        },
        '/verifications': {
          get: {
            summary: 'List verification applications (Pastor & Admin only)',
            responses: {
              '200': { description: 'List of church membership verification requests' }
            }
          },
          post: {
            summary: 'Submit new pastor endorsement or membership verification letter',
            responses: {
              '201': { description: 'Verification application submitted' }
            }
          }
        },
        '/stays': {
          get: {
            summary: 'Get stay requests for user or host',
            responses: {
              '200': { description: 'Stay requests history' }
            }
          },
          post: {
            summary: 'Submit a new stay request (Zero-payment Christian hospitality model)',
            responses: {
              '201': { description: 'Request created and host notified' }
            }
          }
        },
        '/ai/assistant': {
          post: {
            summary: 'AI-Powered Sabbath Travel & Concierge Assistant (Gemini-powered)',
            responses: {
              '200': { description: 'AI generated response' }
            }
          }
        }
      }
    });
  });

  // AI Assistant Endpoint using @google/genai SDK
  app.post('/api/ai/assistant', async (req, res) => {
    try {
      const { action, prompt, context } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        // Fallback intelligent response if key is pending configuration
        if (action === 'ITINERARY') {
          return res.json({
            text: `### 🌅 Sample Sabbath Itinerary for ${context?.destination || 'Your Destination'}

**Friday Evening (Sunset)**
- **6:30 PM**: Welcome sunset worship with host family, candle lighting, and scripture reading.
- **7:15 PM**: Warm Sabbath eve supper (vegan/vegetarian soup, homemade bread & fresh salad).

**Saturday (Sabbath Day)**
- **9:30 AM**: Sabbath School & Bible Study at local Seventh-day Adventist Church.
- **11:00 AM**: Divine Worship Service & Fellowship Sermon.
- **12:45 PM**: Church Potluck or Host Family Fellowship Lunch.
- **3:00 PM**: Afternoon nature walk & Sabbath rest.
- **6:00 PM**: Sunset vespers prayer & week ahead blessing.`
          });
        }

        return res.json({
          text: `I am your AdventistStay AI Sabbath Concierge! I can help you find host families with matching dietary preferences (plant-based/vegetarian), local SDA church proximity, family fellowship, or draft custom Sabbath itineraries. How can I assist your travels today?`
        });
      }

      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      let systemInstruction = "You are the AdventistStay AI Sabbath Assistant—a warm, respectful, knowledgeable Christian concierge for the global Seventh-day Adventist travel and stay community. Focus on Sabbath peace, vegetarian/vegan meal hospitality, local church fellowship, family safety, and Christian hospitality values.";

      if (action === 'ITINERARY') {
        systemInstruction += " Focus on creating a restful, spiritually uplifting Friday Sunset to Saturday Sunset itinerary tailored to the destination, including local SDA church attendance, potluck fellowship, and nature reflection.";
      } else if (action === 'LISTING_ASSISTANT') {
        systemInstruction += " Help hosts write a warm, inviting, Christian host bio and list Sabbath house rules (e.g. sunset worship option, quiet Sabbath hours, vegetarian kitchen guidelines).";
      }

      const userPrompt = prompt || `Help me plan a blessed Sabbath stay at ${context?.destination || 'my destination'}.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: userPrompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      return res.json({
        text: response.text || "May your stay be filled with Sabbath peace and Christian fellowship!"
      });
    } catch (err: any) {
      console.error('AI Assistant Error:', err);
      return res.status(500).json({
        error: 'Failed to process AI assistant request',
        details: err?.message || 'Unknown error'
      });
    }
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AdventistStay Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
