import { pool } from '../connect.js';

// Function to delete folder and its contents (using recursion)
const deleteDatabaseFolder = async (client, username, folder_id) => {
    const querySearch = `SELECT * FROM folders WHERE username = '${username}' AND parent_id = '${folder_id}';`;
    const resultSearch = await client.query(querySearch);

    if (resultSearch.rowCount === 0) {
        console.log('No folder found');
        return;
    } else {
        // Recursively delete subfolders
        resultSearch.rows.map(async (folder) => {
            await deleteDatabaseFolder(client, username, folder.folder_id);

            const queryDelete = `DELETE FROM folders WHERE username = '${username}' AND folder_id = '${folder.folder_id}';`;
            const resultDelete = await client.query(queryDelete);
        
            if (resultDelete.rowCount !== 0) {
                console.log(`Folder ${folder.folder_name} deleted successfully!`);
            }

            return;
        });
    }

    // Delete root folder
    const queryDeleteRoot = `DELETE FROM folders WHERE username = '${username}' AND folder_id = '${folder_id}';`;
    const resultDeleteRoot = await client.query(queryDeleteRoot);

    if (resultDeleteRoot.rowCount !== 0) {
        resultDeleteRoot.rows.forEach(folder => {
            console.log(`Root folder ${folder.folder_name} deleted successfully!`);
        })
    }

}

export const deleteFolderController = async (req, res) => {
    const username = req.query.username;
    const folder_id = req.query.folder_id;

    const client = await pool.connect();
    await deleteDatabaseFolder(client, username, folder_id);

    res.status(200).send('Folder deleted successfully!');
}