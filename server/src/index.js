import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import displayRouter from "./routers/display.js";
import uploadRouter from "./routers/upload.js";
import downloadRouter from "./routers/download.js";
import deleteRouter from "./routers/delete.js";
import Discord, { GatewayIntentBits } from "discord.js";
import { eventHandler } from "./bot/handlers/eventHandler.js";

dotenv.config();

const app = express();
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

const client = new Discord.Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

app.use(express.json());
app.use(cors());
app.use((err, req, res, next) => {
  if (err) {
    res.status(403).json({ message: "Not allowed by CORS" });
  } else {
    next();
  }
});

app.use("/", displayRouter)
app.use("/api/upload", uploadRouter)
app.use("/api/download", downloadRouter)
app.use("/api/delete", deleteRouter)

eventHandler(client);

client.login(process.env.DISCORD_TOKEN);

app.listen(process.env.PORT || 3000, () =>
  console.log(`Server is running on port ${process.env.PORT || 3000}`)
);

export { client }