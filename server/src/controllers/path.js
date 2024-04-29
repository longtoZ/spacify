import { pool } from "../connect.js";

const getFullPath = async (client, username, folderId) => {
    const query = `SELECT * FROM "folders" WHERE username = '${username}' AND folder_id = '${folderId}';`;
    const queryResult = await client.query(query);

    if (queryResult.rowCount !== 0) {
        const current = queryResult.rows[0];
        const parentId = current.parent_id;

        if (parentId === 'null') {
            return [current];
        } else {
            const parentPath = await getFullPath(client, username, parentId);
            parentPath.push(current);
            return parentPath;
        }
    }

    return [];
}

export const pathController = async (req, res) => {
    const username = req.query.username;
    const folderId = username + '_' + req.query.folder_id;

    const client = await pool.connect();
    const fullPath = await getFullPath(client, username, folderId);
    client.release();

    res.status(200).send(fullPath);
}