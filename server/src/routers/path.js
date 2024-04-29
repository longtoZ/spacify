import express from 'express';
import { pathController } from '../controllers/path.js';

const router = express.Router();

router.get('/', pathController);

export default router;
