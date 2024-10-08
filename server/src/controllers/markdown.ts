import {
  Request,
  Response,
  NextFunction,
  Express,
} from 'express-serve-static-core';
import { matchedData } from 'express-validator';
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

// (GET) downloads a document
export async function downloadDocument(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id } = matchedData(req);

  try {
    const document = await Markdown.findById(id).exec();

    if (!document) {
      return res.status(404).json({
        type: 'Resource Not Found Error',
        errorMsgs: 'The document does not exists',
      });
    }

    const { content, fileName } = document;

    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'text/markdown');
    res.send(content);
  } catch (error) {
    return next(createHttpError(500, 'Internal Server Error'));
  }
}

// (POST) creates a new document
export async function createDocument(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { userId } = req.user as Express.User;
  const { fileName: name } = matchedData(req);

  try {
    const document = await Markdown.findOne({ userId, fileName: name }).exec();

    if (document) {
      return res.status(409).json({
        type: 'Conflict Error',
        errorMsgs: 'Document name already exists',
      });
    }

    const { _id, fileName, content, createdAt, updatedAt } =
      await Markdown.create({
        userId,
        fileName: name,
        content: '',
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

// (PATCH) renames an existing document
export async function renameDocument(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { userId } = req.user as Express.User;
  const { fileName: name, _id: id } = matchedData(req);

  try {
    const document = await Markdown.findByIdAndUpdate(
      { userId, _id: id },
      { fileName: name },
      { new: true }
    ).exec();

    // 404 resource not found error
    if (!document) {
      return res.status(404).json({
        type: 'Resource Not Found Error',
        errorMsgs: 'The document does not exists',
      });
    }

    const { _id, fileName, content, createdAt, updatedAt } = document;
    res.status(200).json({ _id, fileName, content, createdAt, updatedAt });
  } catch (error) {
    return next(createHttpError(500, 'Internal Server Error'));
  }
}

// (PUT) saves an existing document
export async function saveDocument(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { _id: id, content: fileContent } = matchedData(req);

  try {
    const document = await Markdown.findByIdAndUpdate(
      { _id: id },
      { content: fileContent },
      { new: true }
    ).exec();

    // 404 resource not found error
    if (!document) {
      return res.status(404).json({
        type: 'Resource Not Found Error',
        errorMsgs: 'The document cannot be found',
      });
    }

    const { _id, fileName, content, createdAt, updatedAt } = document;
    res.status(200).json({ _id, fileName, content, createdAt, updatedAt });
  } catch (error) {
    return next(createHttpError(500, 'Internal Server Error'));
  }
}

// (DELETE) deletes an existing document
export async function deleteDocument(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { userId } = req.user as Express.User;
  const { id } = matchedData(req);

  try {
    const document = await Markdown.findOneAndDelete({ userId, _id: id }).exec();

    if (!document) {
      return res.status(404).json({
        type: 'Resource Not Found Error',
        errorMsgs: 'The document cannot be found',
      });
    }

    res.sendStatus(200);
  } catch (error) {
    return next(createHttpError(500, 'Internal Server Error'));
  }
}
