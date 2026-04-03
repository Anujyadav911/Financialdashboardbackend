const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const { swaggerOptions } = require('./config/swagger');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const recordRoutes = require('./routes/record.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const errorHandler = require('./middleware/errorHandler');
const { notFound } = require('./middleware/notFound');

const app = express();

// ─── Swagger / OpenAPI Docs ───────────────────────────────────────────────────
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Serve raw spec JSON (useful for Postman / code-gen tooling)
app.get('/api/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Swagger UI — disable helmet CSP only on this path so the UI assets load
app.use(
  '/api/docs',
  helmet({
    contentSecurityPolicy: false,   // Swagger UI loads inline scripts
    crossOriginEmbedderPolicy: false,
  }),
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: '💰 Finance Dashboard API Docs',
    customCss: `
      .swagger-ui .topbar { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); }
      .swagger-ui .topbar .download-url-wrapper { display: none; }
      .swagger-ui .info .title { color: #e94560; }
      .swagger-ui .scheme-container { background: #f8f9fa; padding: 12px; border-radius: 8px; }
      .swagger-ui .btn.authorize { background: #e94560; border-color: #e94560; color: #fff; }
      .swagger-ui .btn.authorize:hover { background: #c73652; border-color: #c73652; }
      .swagger-ui .opblock.opblock-post .opblock-summary { border-color: #49cc90; }
      .swagger-ui .opblock.opblock-get .opblock-summary { border-color: #61affe; }
      .swagger-ui .opblock.opblock-put .opblock-summary { border-color: #fca130; }
      .swagger-ui .opblock.opblock-delete .opblock-summary { border-color: #f93e3e; }
      .swagger-ui .opblock.opblock-patch .opblock-summary { border-color: #50e3c2; }
    `,
    swaggerOptions: {
      persistAuthorization: true,      // Keep token across page refreshes
      displayRequestDuration: true,    // Show response time
      filter: true,                    // Enable search/filter bar
      tryItOutEnabled: true,           // Expand try-it-out by default
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
      docExpansion: 'list',            // Collapse all but show tags
    },
  })
);

// ─── Security Middleware (applied after docs route) ───────────────────────────
app.use(helmet());
app.use(mongoSanitize());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});
app.use('/api', limiter);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Logging ──────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Finance Dashboard API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    docs: `http://localhost:${process.env.PORT || 5000}/api/docs`,
  });
});

// ─── API Info Route — fixes Swagger UI server ping 404 ────────────────────────
app.get('/api/v1', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Finance Dashboard API v1',
    version: '1.0.0',
    docs: `http://localhost:${process.env.PORT || 5000}/api/docs`,
    endpoints: {
      auth:      '/api/v1/auth',
      users:     '/api/v1/users',
      records:   '/api/v1/records',
      dashboard: '/api/v1/dashboard',
    },
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/records', recordRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
