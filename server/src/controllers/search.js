import { pool } from "../connect.js";

export const searchController = async (req, res) => {
    const username = req.query.username;
    const keyword = req.query.name;

    const queryFiles = `SELECT DISTINCT files.* FROM files INNER JOIN folders ON (folders.username = '${username}' AND files.file_name ILIKE '%${keyword}%')`;
    const queryFolders = `SELECT * FROM folders WHERE username = '${username}' AND folder_name ILIKE '%${keyword}%'`;

    const client = await pool.connect();
    const queryFilesResult = await client.query(queryFiles);
    const queryFoldersResult = await client.query(queryFolders);

    const result = {
        folders: [],
        files: []
    };

    for (const row of queryFoldersResult.rows) {
        const queryParentName = await client.query(`SELECT folder_name FROM folders WHERE parent_id = '${row.parent_id}'`);
        row.folder_name = queryParentName.rows[0].folder_name;
        result.folders.push(row)
    }

    for (const row of queryFilesResult.rows) {
        const queryFolderName = await client.query(`SELECT folder_name FROM folders WHERE folder_id = '${row.folder_id}'`);
        row.folder_name = queryFolderName.rows[0].folder_name;
        result.files.push(row)
    }

    res.status(200).send(result);

    client.release();
}