import express from 'express';
import { deleteController } from '../controllers/delete.js';

const router = express.Router();

router.delete('/', deleteController);

export default router;
