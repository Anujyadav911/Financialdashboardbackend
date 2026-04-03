require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/finance_dashboard';

// ─── Database Connection ──────────────────────────────────────────────────────
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅  MongoDB connected successfully');
    // Start server only after DB is connected
    app.listen(PORT, () => {
      console.log(`🚀  Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`📡  Health check:  http://localhost:${PORT}/health`);
      console.log(`📚  API Base URL:  http://localhost:${PORT}/api/v1`);
      console.log(`📖  Swagger Docs:  http://localhost:${PORT}/api/docs`);
      console.log(`🔧  OpenAPI JSON:  http://localhost:${PORT}/api/docs.json`);
    });
  })
  .catch((err) => {
    console.error('❌  MongoDB connection failed:', err.message);
    process.exit(1);
  });

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  process.exit(1);
});
