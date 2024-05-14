import { pool } from '../connect.js';
import { createTimestampInt } from '../utils/common.js';

const createHomeFolder = async (username, folder_date) => {
    const queryCheck = `SELECT * FROM "folders" WHERE username = '${username}' AND folder_name = 'home';`;
    const queryCreate = `INSERT INTO "folders" (username, folder_id, parent_id, folder_name, folder_date) VALUES ('${username}', '${username}_home', 'null', 'home', '${folder_date}');`;

    const client = await pool.connect();
    const queryCheckFolders = await client.query(queryCheck);
    if (queryCheckFolders.rowCount === 0) {
        console.log('Creating home folder...');

        console.log(queryCreate);
        const queryCreateFolders = await client.query(queryCreate);
        if (queryCreateFolders.rowCount === 0) {
            console.log('Failed to create home folder');
        } else {
            console.log('Home folder created successfully');
        }
    } else {
        console.log('Home folder already exists');
    }

    client.release();
};

const createFolder = async (
    res,
    username,
    folder_id,
    parent_id,
    folder_name,
    folder_date,
) => {
    const query = `INSERT INTO "folders" (username, folder_id, parent_id, folder_name, folder_date) VALUES ('${username}', '${folder_id}', '${parent_id}', '${folder_name}', '${folder_date}');`;

    console.log(query);
    const client = await pool.connect();
    const queryFolders = await client.query(query);

    if (queryFolders.rowCount === 0) {
        res.status(500).send('Failed to create folder');
    } else {
        res.status(200).send('Folder created successfully');
    }

    client.release();
};

export const folderController = async (req, res) => {
    const username = req.query.username;
    const folder_id = username + '_' + createTimestampInt().toString();
    const parent_id = username + '_' + req.query.parent_id;
    const folder_name = req.body.folder_name;
    const folder_date = createTimestampInt();

    await createHomeFolder(username, folder_date);
    await createFolder(
        res,
        username,
        folder_id,
        parent_id,
        folder_name,
        folder_date,
    );
};
