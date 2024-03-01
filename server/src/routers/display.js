import express from 'express';
import { displayController } from '../controllers/display.js';

const router = express.Router();

router.get('/', displayController);

export default router;