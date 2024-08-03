import { Request, Response, NextFunction } from 'express-serve-static-core';
import { validationResult } from 'express-validator';

// backend input error handling for express-validator
function validateCredentialsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const errorMsgs: { [key: string]: string } = {};
    result.array().forEach((err) => {
      switch (err.type) {
        case 'field':
          errorMsgs[err.path] = err.msg;
          break;
        default:
          throw new Error(`Unknown error type: ${err.type}`);
      }
    });
    return res.status(400).json({ type: 'Bad Request Error', errorMsgs });
  }

  next();
}

export default validateCredentialsMiddleware;
