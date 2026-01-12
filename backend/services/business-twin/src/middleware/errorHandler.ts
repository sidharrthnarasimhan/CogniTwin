import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Error occurred', {
    message: err.message,
    stack: err.stack,
    path: req.path,
  });

  res.status(err.statusCode || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      statusCode: err.statusCode || 500,
    },
  });
};
