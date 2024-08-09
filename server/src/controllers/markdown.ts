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

// (POST) proceses and creates a new document from a file uploaded to the server
export async function uploadFile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { userId } = req.user as Express.User;
  const { file } = req;

  if (!file) {
    return res
      .status(400)
      .json({ type: 'Bad Request Error', errorMsgs: 'Please select a file' });
  }

  const name = file.originalname;

  try {
    const document = await Markdown.findOne({ userId, fileName: name }).exec();

    if (document) {
      return res.status(409).json({
        type: 'Conflict Error',
        errorMsgs: 'File name already exists',
      });
    }

    const fileContent = Buffer.from(file.buffer).toString('utf-8');

    const { _id, fileName, content, createdAt, updatedAt } =
      await Markdown.create({
        userId,
        fileName: name,
        content: fileContent,
      });

    res.status(201).json({
      _id,
      fileName,
      content,
      createdAt,
      updatedAt,
    });
  } catch (error) {
    return next(createHttpError(500, 'Internal Server Error'));
  }
}
