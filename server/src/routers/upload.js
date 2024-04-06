import express from 'express';
import { uploadController } from '../controllers/upload.js';
import multer from 'multer';
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 1000 * 1024 * 1024 }, // Optional: Set a limit for file size (1GB in this example)
  })
const router = express.Router();

router.post('/', upload.single('file') ,uploadController);

export default router;