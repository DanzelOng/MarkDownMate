import { Request, Response, NextFunction } from 'express-serve-static-core';
import createHttpError from 'http-errors';

function requiresAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  req.user?.isVerified
    ? next()
    : next(createHttpError(401, '401 Unauthorized access'));
}

export default requiresAuthMiddleware;
