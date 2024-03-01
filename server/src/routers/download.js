import express from 'express';
import { downloadController } from '../controllers/download.js';

const router = express.Router();

router.get('/', downloadController);

export default router;