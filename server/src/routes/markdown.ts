import { Router } from 'express';
import * as markdownController from '../controllers/markdown';

const router = Router();

// retrieves user's documents
router.get('/retrieve', markdownController.retrieveDocuments);

export default router
