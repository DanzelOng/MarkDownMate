import { Router } from 'express';
import fileUploadMiddleware from '../middlewares/fileUpload';
import * as markdownController from '../controllers/markdown';

const router = Router();

// retrieves user's documents
router.get('/retrieve', markdownController.retrieveDocuments);

// uploads a markdown document
router.post('/upload', fileUploadMiddleware, markdownController.uploadFile);

export default router;
