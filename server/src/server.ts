import './database/mongo';
import env from './utils/validateEnv';
import express from 'express';
import morgan from 'morgan';
import { Request, Response, NextFunction } from 'express-serve-static-core';
import createHttpError, { isHttpError } from 'http-errors';
import authRouter from './routes/auth';
import markdownRouter from './routes/markdown';

const app = express();

if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// global middlewares
app.use(express.json());

// routes middlewares
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/markdown', markdownRouter);

// catch all unknown endpoints and throws error
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(createHttpError(404, '404 Page Not Found'));
});

// global error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  let statusCode = 500;
  let errorMsg = 'Internal Server Error';

  if (isHttpError(err)) {
    statusCode = err.status;
    errorMsg = err.message;
  }

  res.status(statusCode).json({
    message: errorMsg,
  });
});

app.listen(env.PORT, () => {
  console.log(`Server listening on port ${env.PORT}`);
});
