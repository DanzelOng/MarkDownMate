import { Request, Express } from 'express';
import multer, { FileFilterCallback } from 'multer';
import createHttpError from 'http-errors';

function fileValidationMiddleware(
  req: Request,
  file: Express.Multer.File,
  done: FileFilterCallback
) {
  file.originalname.endsWith('.md')
    ? done(null, true)
    : done(createHttpError(400, 'Only accept markdown files'));
}

const fileUploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1048576 }, // file size limit of 1 MB
  fileFilter: fileValidationMiddleware,
}).single('file');

export default fileUploadMiddleware;
