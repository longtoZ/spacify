import express from 'express';
import { folderController } from '../controllers/createFolder.js';

const router = express.Router();

router.post('/', folderController);

export default router;