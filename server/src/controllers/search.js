import { pool } from "../connect.js";

const sizeReference = {
    'small': [0, 1000000],
    'medium': [1000000, 100000000],
    'large': [100000000, 10000000000],
    'huge': [10000000000, 1000000000000],
    'all': [0, 1000000000000000],
}

export const searchController = async (req, res) => {
    const username = req.query.username;
    const keyword = req.query.name;
    const type = req.query.type;
    const size = sizeReference[req.query.size];
    const date = req.query.date;
    let dateStart = 0;

    if (date === 'last 1 day') {
        dateStart = Date.now() - 86400000;
    } else if (date === 'last 7 days') {
        dateStart = Date.now() - (86400000 * 7);
    } else if (date === 'last 30 days') {
        dateStart = Date.now() - (86400000 * 30);
    }

    const result = {
        folders: [],
        files: []
    };

    const queryFiles = `SELECT DISTINCT files.* FROM files INNER JOIN folders ON (folders.username = '${username}' AND files.file_name ILIKE '%${keyword}%' AND (files.file_size >= ${size[0]} AND files.file_size <= ${size[1]}) AND files.file_date >= ${dateStart})`;
    const queryFolders = `SELECT * FROM folders WHERE username = '${username}' AND folder_name ILIKE '%${keyword}%'  AND parent_id != 'null' AND folder_date >= ${dateStart}`;

    const client = await pool.connect();

    if (type === 'all' || type === 'folder') {
        // Query folders
        const queryFoldersResult = await client.query(queryFolders);

        for (const row of queryFoldersResult.rows) {
            const queryFolderName = await client.query(`SELECT folder_name FROM folders WHERE folder_id = '${row.folder_id}'`);
            row.folder_name = queryFolderName.rows[0].folder_name;
            result.folders.push(row)
        }
    }

    if (type === 'all' || type === 'file') {
        // Query files
        const queryFilesResult = await client.query(queryFiles);

        for (const row of queryFilesResult.rows) {
            const queryFolderName = await client.query(`SELECT folder_name FROM folders WHERE folder_id = '${row.folder_id}'`);
            row.folder_name = queryFolderName.rows[0].folder_name;
            result.files.push(row)
        }
    }

    res.status(200).send(result);

    client.release();
}