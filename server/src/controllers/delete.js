import { pool } from '../connect.js';
import { client } from '../index.js';
import { wait } from '../utils/common.js';
import { MAX_RETRIES } from '../utils/constants.js';

let retryCount = 0;

// Function to delete attachment with retries
async function deleteAttachment(channel, message_id) {
    try {
        const message = await channel.messages.fetch(message_id);
        await message.delete();
        retryCount = 0; // Reset the retry count
    } catch (error) {
        const errorObj = JSON.parse(JSON.stringify(error));

        if (errorObj.code === 'UND_ERR_CONNECT_TIMEOUT') {
            retryCount++;
            console.error('Timeout error.');

            if (retryCount < MAX_RETRIES) {
                console.log(`Retrying delete attempt ${retryCount}...`);
                await wait(2000); // Wait for 2 seconds before retrying
                await deleteAttachment(channel, message_id);
            } else {
                console.error('Maximum delete retries reached. Giving up.');
            }
        }
    }
}

async function deleteServerMessage(channel_id, file_id) {
    const channel = await client.channels.fetch(channel_id);
    const dbClient = await pool.connect();

    const queryFiles = `SELECT * FROM "datas" WHERE "username" = 'Nautilus' AND "file_id" = '${file_id}';`;

    const query = await pool.query(queryFiles);
    if (query.rowCount === 0) {
        console.log('No file found');
    } else {
        const messagesId = query.rows.map((file) => file.message_id);
        console.log(messagesId);

        for (let index = 0; index < messagesId.length; index++) {
            await deleteAttachment(channel, messagesId[index]);
            console.log(`Deleted message ${messagesId[index]}`);
        }
    }

    dbClient.release();
}

const deleteDatabaseMessage = (res, username, file_id) => {
    const query = `DELETE FROM "files" WHERE "username" = '${username}' AND "file_id" = '${file_id}';`;

    pool.connect().then((client) => {
        console.log('Ready to delete...');

        pool.query(query, (err, result) => {
            if (err) {
                res.status(500).send(err);
            } else {
                res.status(200).send('File deleted successfully!');
            }
        });

        client.release();
    });
};

export const deleteController = async (req, res) => {
    const username = req.query.username;
    const channel_id = req.query.channel_id;
    const file_id = req.query.file_id;

    deleteServerMessage(channel_id, file_id).then(() => {
        deleteDatabaseMessage(res, username, file_id);
    });
};
