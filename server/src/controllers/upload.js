import { pool } from '../connect.js';
import { client } from '../index.js';
import { createTimestampString, wait } from '../utils/common.js';
import { MAX_RETRIES } from '../utils/constants.js';

let retryCount = 0;

// Function to send attachment to a channel
const sendAttachment = async (channel_id, filename, file) => {
    const channel = await client.channels.fetch(channel_id);
    const message = await channel.send({
        content: 'New file uploaded!',
        files: [
            {
                attachment: Buffer.from(file),
                name: filename,
            },
        ],
    });

    return {
        url: message.attachments.first().url,
        id: message.id,
    };
};

// Function to upload file with retries
async function uploadWithRetry(channel_id, outputFilePath, chunk) {
    let file_info = {};

    try {
        file_info = await sendAttachment(channel_id, outputFilePath, chunk);
        console.log(file_info);
        retryCount = 0; // Reset the retry count
    } catch (error) {
        const errorObj = JSON.parse(JSON.stringify(error));

        if (errorObj.code === 'UND_ERR_CONNECT_TIMEOUT') {
            retryCount++;
            console.error('Timeout error.');

            if (retryCount < MAX_RETRIES) {
                console.log(`Retrying upload attempt ${retryCount}...`);
                await wait(2000); // Wait for 2 seconds before retrying
                file_info = await uploadWithRetry(
                    channel_id,
                    outputFilePath,
                    chunk,
                );
            } else {
                console.error('Maximum upload retries reached. Giving up.');
            }
        }
    }

    return file_info;
}

// Function to split file into chunks and return the chunk data
const splitAndSendFile = async (
    io,
    socket_id,
    channel_id,
    order,
    fileBuffer,
    file_id,
) => {
    const chunkSize = 1024 * 1024;
    let offset = 0;
    let chunkNumber = 1;
    const chunk_data = [];

    while (offset < fileBuffer.length) {
        const chunk = fileBuffer.slice(offset, offset + chunkSize);
        const outputFilePath = file_id + '_' + chunkNumber + '.txt';

        const file_info = await uploadWithRetry(
            channel_id,
            outputFilePath,
            chunk,
        );

        io.to(socket_id).emit('uploaded_chunk', {
            order: order,
            percentage: ((offset + chunkSize) / fileBuffer.length) * 100,
        });

        chunk_data.push({
            chunkNumber,
            file_url: file_info.url,
            message_id: file_info.id,
        });

        offset += chunkSize;
        chunkNumber++;
    }

    return chunk_data;
};

// Function to post file data to table
const postFileData = async (
    res,
    username,
    file_id,
    folder_id,
    file_name,
    file_type,
    file_size,
    file_date,
    chunk_data,
) => {
    // Connect to the database
    const client = await pool.connect();
    console.log('Connected to database');

    // Check if the username and folder are matched
    const queryFolder = `SELECT * FROM "folders" WHERE username = '${username}' AND folder_id = '${folder_id}';`;
    const queryFolderResult = await client.query(queryFolder);

    if (queryFolderResult.rowCount === 0) {
        res.status(500).send('Folder does not exist');
    }

    // Insert the file data into the database
    const queryFiles = `INSERT INTO "files" (file_id, folder_id, file_name, file_type, file_size, file_date) VALUES ('${file_id}', '${folder_id}', '${file_name}', '${file_type}', '${file_size}', '${file_date}');`;
    
    console.log(queryFiles)
    const queryDatas =
        `INSERT INTO "datas" (file_id, chunk, message_id) VALUES` +
        chunk_data
            .map(
                (chunk) =>
                    `('${file_id}', ${chunk.chunkNumber}, '${chunk.message_id}')`,
            )
            .join(', ') +
        ';';

    // Insert into the "files" table
    const queryFilesResult = await pool.query(queryFiles);
    if (queryFilesResult.rowCount === 0) {
        res.status(500).send('Failed to upload file data');
    }

    // Insert into the "datas" table
    const queryDatasResult = await pool.query(queryDatas);
    if (queryDatasResult.rowCount === 0) {
        res.status(500).send('Failed to upload file data');
    } else {
        res.status(200).send('File uploaded successfully');
    }

    client.release();
};

// Controller to handle file upload
export const uploadController = async (req, res) => {
    const io = req.app.get('socketio');
    const socket_id = req.query.socket_id;
    const username = req.query.username;
    const channel_id = req.query.channel_id;
    const folder_id = username + '_' + req.query.folder_id;
    const order = req.query.order;
    const timestampString = createTimestampString();

    const file = req.file;
    const file_name = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const file_type = file.mimetype;
    const file_size = file.size;
    const file_date = timestampString;
    const file_id =
        username + '_' + timestampString;

    // Socket connection for uploading files
    const chunk_data = await splitAndSendFile(
        io,
        socket_id,
        channel_id,
        order,
        file.buffer.toString('base64'),
        file_id,
    );

    const file_data = await postFileData(
        res,
        username,
        file_id,
        folder_id,
        file_name,
        file_type,
        file_size,
        file_date,
        chunk_data,
    );
};
