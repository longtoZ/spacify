import express from 'express';
import { deleteFolderController } from '../controllers/deleteFolder.js';

const router = express.Router();

router.delete('/', deleteFolderController);

export default router;