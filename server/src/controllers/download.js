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
    socket_id,
    username,
    channel_id,
    file_id,
    file_name,
) {
    const content = [];
    const query = `SELECT * FROM "datas" WHERE "username" = '${username}' AND "file_id" = '${file_id}' ORDER BY "chunk" ASC;`;

    const client = await pool.connect();
    console.log('Connected to database for download');

    const queryFiles = await pool.query(query);
    if (queryFiles.rowCount === 0) {
        res.status(500).send('Failed to download file data');
    } else {
        const messageIds = queryFiles.rows.map((file) => file.message_id);

        for (let index = 0; index < messageIds.length; index++) {
            const text = await downloadWithRetry(channel_id, messageIds[index]);

            // Send progress to client
            io.to(socket_id).emit('downloaded_chunk', {
                percentage: ((index + 1) / messageIds.length) * 100,
            });

            content.push(text);
        }

        mergeFileContent(res, content, file_name);
    }

    client.release();
}

// Controller to handle file download
export const downloadController = async (req, res) => {
    const io = req.app.get('socketio');
    const username = req.query.username;
    const channel_id = req.query.channel_id;
    const file_id = req.query.file_id;
    const file_name = req.query.file_name;
    const socket_id = req.query.socket_id;

    console.log('Id from client: ', socket_id);

    await downloadFile(
        res,
        io,
        socket_id,
        username,
        channel_id,
        file_id,
        file_name,
    );
};
