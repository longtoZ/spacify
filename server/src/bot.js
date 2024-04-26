import Discord, { GatewayIntentBits } from 'discord.js';
import { eventHandler } from './bot/handlers/eventHandler.js';
import dotenv from 'dotenv';
import { wait } from './utils/common.js';
import { MAX_RETRIES } from './utils/constants.js';

dotenv.config();

let retryCount = 0;

// Function to login to Discord with retries
async function loginWithRetry(client) {
    try {
        await client.login(process.env.DISCORD_TOKEN);
        retryCount = 0; // Reset the retry count
    } catch (error) {
        retryCount++;
        console.error('Failed to login to Discord:', error);

        if (retryCount < MAX_RETRIES) {
            console.log(`Retrying login attempt ${retryCount}...`);
            await wait(2000); // Wait for 2 seconds before retrying
            await loginWithRetry(client);
        } else {
            console.error('Maximum login retries reached. Giving up.');
        }
    }
}

export default function connectBot() {
    const client = new Discord.Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
        ],
    });

    eventHandler(client);

    loginWithRetry(client);

    return client;
}
