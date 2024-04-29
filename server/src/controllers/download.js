import { pool } from '../connect.js';
import { client } from '../index.js';
import { wait } from '../utils/common.js';

let retryCount = 0;
const maxRetries = 3; // Set the maximum number of retries

// Function to fetch content from a single URL
async function fetchFileContent(channel_id, message_id) {
    const channel = await client.channels.fetch(channel_id);
    const message = await channel.messages.fetch(message_id);
    const url = message.attachments.first().url;

    const response = await fetch(url, {
        timeout: 5000,
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}`);
    } else {
        console.log(`Fetched ${url}`);
    }
    return response.text();
}

// Function to download file content with retries
async function downloadWithRetry(channel_id, message_id) {
    let text = '';

    try {
        text = await fetchFileContent(channel_id, message_id);
        retryCount = 0; // Reset the retry count
    } catch (error) {
        const errorObj = JSON.parse(JSON.stringify(error));

        console.log(errorObj)

        if (errorObj.cause.code === 'UND_ERR_CONNECT_TIMEOUT') {
            retryCount++;
            console.error('Timeout error.');

            if (retryCount < maxRetries) {
                console.log(`Retrying download attempt ${retryCount}...`);
                await wait(2000); // Wait for 2 seconds before retrying
                text = await downloadWithRetry(channel_id, message_id);
            } else {
                console.error('Maximum download retries reached. Giving up.');
            }
        }
    }

    return text;
}

function mergeFileContent(res, content, file_name) {
    // Merge the contents into one text file
    const mergedContent = content.join('\n');

    res.setHeader('Content-Disposition', 'attachment; filename=' + file_name);
    res.setHeader('Content-Type', 'application/octet-stream');

    // Send the merged content directly in the response
    res.send(mergedContent);
}

async function downloadFile(
    res,
    io,
    socketId,
    username,
    channelId,
    folderId,
    fileId,
    fileName,
) {
    const client = await pool.connect();
    console.log('Connected to database for download');

    // Check if the username and folder are matched
    const queryFolder = `SELECT * FROM "folders" WHERE username = '${username}' AND folder_id = '${folderId}';`;
    const queryFolderResult = await client.query(queryFolder);

    if (queryFolderResult.rowCount === 0) {
        res.status(500).send('Folder does not exist');
    }

    // Check if the file exists
    const queryFiles = `SELECT * FROM "files" WHERE file_id = '${fileId}' AND folder_id = '${folderId}';`;
    const queryFilesResult = await client.query(queryFiles);

    if (queryFilesResult.rowCount === 0) {
        res.status(500).send('File does not exist');
    }

    // Fetch the file data from the database
    const content = [];
    const queryData = `SELECT * FROM datas WHERE file_id = '${fileId}' ORDER BY "chunk" ASC;`;

    const queryDataResult = await pool.query(queryData);
    if (queryDataResult.rowCount === 0) {
        res.status(500).send('Failed to download file data');
    } else {
        const messageIds = queryDataResult.rows.map((file) => file.message_id);

        for (let index = 0; index < messageIds.length; index++) {
            const text = await downloadWithRetry(channelId, messageIds[index]);

            // Send progress to client
            io.to(socketId).emit('downloaded_chunk', {
                percentage: ((index + 1) / messageIds.length) * 100,
            });

            content.push(text);
        }

        mergeFileContent(res, content, fileName);
    }

    client.release();
}

// Controller to handle file download
export const downloadController = async (req, res) => {
    const io = req.app.get('socketio');
    const username = req.query.username;
    const channelId = req.query.channel_id;
    const folderId = req.query.folder_id;
    const fileId = req.query.file_id;
    const fileName = req.query.file_name;
    const socketId = req.query.socket_id;

    console.log('Id from client: ', socketId);

    await downloadFile(
        res,
        io,
        socketId,
        username,
        channelId,
        folderId,
        fileId,
        fileName,
    );
};
