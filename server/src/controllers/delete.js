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

async function deleteServerMessage(username, channelId, folderId, fileId) {
    const channel = await client.channels.fetch(channelId);
    const dbClient = await pool.connect();

    // Check if the username and folder are matched
    const queryFolder = `SELECT * FROM "folders" WHERE username = '${username}' AND folder_id = '${folderId}';`;
    const queryFolderResult = await dbClient.query(queryFolder);

    if (queryFolderResult.rowCount === 0) {
        res.status(500).send('Folder does not exist');
    }

    // Check if the file exists
    const queryFiles = `SELECT * FROM "files" WHERE file_id = '${fileId}' AND folder_id = '${folderId}';`;
    const queryFilesResult = await dbClient.query(queryFiles);

    if (queryFilesResult.rowCount === 0) {
        res.status(500).send('File does not exist');
    }

    // Delete the file
    const queryDeleteFiles = `SELECT * FROM datas WHERE file_id = '${fileId}';`;
    const query = await dbClient.query(queryDeleteFiles);

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

const deleteDatabaseMessage = async (res, file_id) => {
    const query = `DELETE FROM "files" WHERE "file_id" = '${file_id}';`;

    const client = await pool.connect();
    const queryFiles = await client.query(query);

    if (queryFiles.rowCount === 0) {
        res.status(500).send('Failed to delete file');
    } else {
        res.status(200).send('File deleted successfully');
    }

    client.release();
};

export const deleteController = async (req, res) => {
    const username = req.query.username;
    const channelId = req.query.channel_id;
    const folderId = req.query.folder_id;
    const fileId = req.query.file_id;

    deleteServerMessage(username, channelId, folderId, fileId).then(() => {
        deleteDatabaseMessage(res, fileId);
    });
};
