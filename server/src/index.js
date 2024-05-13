import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import createSocketServer from './socket.js';
import connectBot from './bot.js';

import displayRouter from './routers/display.js';
import pathRouter from './routers/path.js';
import createFolderRouter from './routers/createFolder.js';
import deleteFolderRouter from './routers/deleteFolder.js';
import uploadRouter from './routers/upload.js';
import downloadRouter from './routers/download.js';
import deleteRouter from './routers/delete.js';
import loginRouter from './routers/login.js';
import searchRouter from './routers/search.js';

import { verifyToken } from './middleware/verify.js';

dotenv.config();

// Discord bot
const client = connectBot();

// Express server
const app = express();
const expressServer = app.listen(process.env.PORT || 3000, () =>
    console.log(`Server is running on port ${process.env.PORT || 3000}`),
);

const allowedOrigins = [process.env.CLIENT];
const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200,
    credentials: true,
};

app.use(express.json());
app.use(cors(corsOptions));
app.use((err, req, res, next) => {
    if (err) {
        res.status(403).json({ message: 'Not allowed by CORS' });
    } else {
        next();
    }
});

app.use('/dashboard', verifyToken, displayRouter);
app.use('/api/path', verifyToken, pathRouter);
app.use('/api/create_folder', verifyToken, createFolderRouter);
app.use('/api/delete_folder', verifyToken, deleteFolderRouter);
app.use('/api/upload', verifyToken, uploadRouter);
app.use('/api/download', verifyToken, downloadRouter);
app.use('/api/delete', verifyToken, deleteRouter);
app.use('/api/login', loginRouter);
app.use('/api/search', verifyToken, searchRouter);

// Socket
const io = createSocketServer(expressServer, allowedOrigins);

app.set('socketio', io);

export { client };
