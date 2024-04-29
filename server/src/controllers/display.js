import { pool } from '../connect.js';

export const displayController = async (req, res) => {
    const username = req.query.username;
    const folder_id = username + '_' + req.query.folder_id;

    const queryFiles = `SELECT DISTINCT files.* FROM folders INNER JOIN files ON (folders.username = '${username}' AND files.folder_id = '${folder_id}')`;
    const queryFolders = `SELECT * FROM folders WHERE username = '${username}' AND parent_id = '${folder_id}'`;

    // console.log(queryFiles)

    const client = await pool.connect();
    const queryFilesResult = await client.query(queryFiles);
    const queryFoldersResult = await client.query(queryFolders);

    const result = {
        folders: [],
        files: []
    };

    queryFoldersResult.rows.forEach((row) => {
        result.folders.push(row)
    })

    queryFilesResult.rows.forEach((row) => {
        result.files.push(row)
    })

    res.status(200).send(result);

    client.release();

};
