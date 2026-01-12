import express from 'express';
import dotenv from 'dotenv';
import twinRouter from './routes/twin';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'business-twin',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/twin', twinRouter);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Business Twin Service running on port ${PORT}`);
});

export default app;
