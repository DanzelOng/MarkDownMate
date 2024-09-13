import './database/mongo';
import env from './utils/validateEnv';
import express from 'express';
import passport from 'passport';
import MongoStore from 'connect-mongo';
import session from 'express-session';
import morgan from 'morgan';
import cors, { CorsOptions } from 'cors';
import { Request, Response, NextFunction } from 'express-serve-static-core';
import createHttpError, { isHttpError } from 'http-errors';
import requiresAuthMiddleware from './middlewares/requiresAuth';
import authRouter from './routes/auth';
import markdownRouter from './routes/markdown';

// cors configuration
const corsOptions: CorsOptions = {
  origin: env.CLIENT_URL,
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  exposedHeaders: ['Content-Disposition'],
};

const app = express();

// global middlewares
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(cors(corsOptions));
app.use(
  session({
    secret: env.SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000,   // 1hr
      secure: env.NODE_ENV === 'production' ? true : false,
      domain: env.NODE_ENV === 'production' ? env.COOKIE_DOMAIN : undefined,
    },
    store: MongoStore.create({ mongoUrl: env.MONGO_CONNECTION_STRING }),
  })
);

app.use(express.json());
app.use(passport.session());

// routes middlewares
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/markdown', requiresAuthMiddleware, markdownRouter);

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
