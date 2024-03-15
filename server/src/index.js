import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { Server } from "socket.io";

import Discord, { GatewayIntentBits } from "discord.js";
import { eventHandler } from "./bot/handlers/eventHandler.js";

import displayRouter from "./routers/display.js";
import uploadRouter from "./routers/upload.js";
import downloadRouter from "./routers/download.js";
import deleteRouter from "./routers/delete.js";
import loginRouter from "./routers/login.js";

import { verifyToken } from "./middleware/verify.js";

dotenv.config();

// Express server
const app = express();
const expressServer = app.listen(process.env.PORT || 3000, () =>
  console.log(`Server is running on port ${process.env.PORT || 3000}`)
);

const allowedOrigins = [process.env.CLIENT];
const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  optionsSuccessStatus: 200,
  credentials: true,
};

app.use(express.json());
app.use(cors(corsOptions));
app.use((err, req, res, next) => {
  if (err) {
    res.status(403).json({ message: "Not allowed by CORS" });
  } else {
    next();
  }
});

app.use("/dashboard", verifyToken, displayRouter)
app.use("/api/upload", verifyToken, uploadRouter)
app.use("/api/download", verifyToken, downloadRouter)
app.use("/api/delete", verifyToken, deleteRouter)
app.use("/api/login", loginRouter)

// Socket
const io = new Server(expressServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// Discord bot
const client = new Discord.Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

eventHandler(client);

client.login(process.env.DISCORD_TOKEN);

export { client, io }