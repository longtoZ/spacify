import express from 'express';
import { deleteController } from '../controllers/delete.js';

const router = express.Router();

router.get('/', deleteController);

export default router;
