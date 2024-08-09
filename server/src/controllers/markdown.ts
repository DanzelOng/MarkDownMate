import {
  Request,
  Response,
  NextFunction,
  Express,
} from 'express-serve-static-core';
import createHttpError from 'http-errors';
import Markdown from '../models/markdown';

// (GET) fetches all documents
export async function retrieveDocuments(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { userId } = req.user as Express.User;

  try {
    const documents = await Markdown.find({ userId }, '-userId -__v ').exec();
    res.status(200).json(documents);
  } catch (error) {
    return next(createHttpError(500, 'Internal Server Error'));
  }
}
