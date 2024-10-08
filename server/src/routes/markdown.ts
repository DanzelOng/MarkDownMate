import { Router } from 'express';
import { checkSchema, Schema } from 'express-validator';
import fileUploadMiddleware from '../middlewares/fileUpload';
import validateCredentialsMiddleware from '../middlewares/validateCredentials';
import * as rateLimiters from '../middlewares/rateLimiters';
import * as markdownController from '../controllers/markdown';

const documentSchema: Schema = {
  _id: {
    exists: {
      bail: true,
      errorMessage: '_id property was not defined in request body',
    },
    trim: true,
    notEmpty: {
      bail: true,
      errorMessage: 'Document ID is required',
    },
    isMongoId: {
      errorMessage: 'Invalid MongoId format',
    },
  },
  fileName: {
    exists: {
      bail: true,
      errorMessage: 'fileName property was not defined in request body',
    },
    trim: true,
    notEmpty: {
      bail: true,
      errorMessage: 'Document must have a name',
    },
    matches: {
      options: /^[^\s.][\w]*\.md$/,
      errorMessage: 'Invalid document format',
    },
  },
  content: {
    exists: {
      bail: true,
      errorMessage: 'content property was not defined in request body',
    },
    trim: true,
  },
  createdAt: {
    exists: {
      bail: true,
      errorMessage: 'createdAt property was not defined in request body',
    },
    trim: true,
    notEmpty: {
      bail: true,
      errorMessage: 'createdAt field is undefined',
    },
    isISO8601: {
      errorMessage: 'Invalid date format',
    },
  },
  updatedAt: {
    exists: {
      bail: true,
      errorMessage: 'updatedAt property was not defined in request body',
    },
    trim: true,
    notEmpty: {
      bail: true,
      errorMessage: 'updatedAt field is undefined',
    },
    isISO8601: {
      errorMessage: 'Invalid date format',
    },
  },
};

const createSchema: Schema = {
  fileName: documentSchema.fileName,
};

const renameSchema: Schema = {
  _id: documentSchema._id,
  fileName: documentSchema.fileName,
};

const deleteSchema: Schema = {
  id: {
    trim: true,
    notEmpty: {
      bail: true,
      errorMessage: 'id parameter was not provided in URL path params',
    },
    isMongoId: {
      errorMessage: 'Invalid MongoId format',
    },
  },
};

const downloadSchema: Schema = {
  id: deleteSchema.id,
};

const router = Router();

// retrieves user's documents
router.get('/retrieve', markdownController.retrieveDocuments);

// downloads a document
router.get(
  '/download/:id',
  checkSchema(downloadSchema, ['params']),
  validateCredentialsMiddleware,
  markdownController.downloadDocument
);

// creates a new document
router.post(
  '/create',
  checkSchema(createSchema, ['body']),
  validateCredentialsMiddleware,
  markdownController.createDocument
);

// uploads a markdown document
router.post('/upload', fileUploadMiddleware, markdownController.uploadFile);

// renames markdown document
router.patch(
  '/rename',
  checkSchema(renameSchema, ['body']),
  validateCredentialsMiddleware,
  markdownController.renameDocument
);

// saves an existing document
router.put(
  '/save',
  rateLimiters.limitSaveDocumentMiddleware,
  checkSchema(documentSchema, ['body']),
  validateCredentialsMiddleware,
  markdownController.saveDocument
);

// deletes a document
router.delete(
  '/delete/:id',
  checkSchema(deleteSchema, ['params']),
  validateCredentialsMiddleware,
  markdownController.deleteDocument
);

export default router;
