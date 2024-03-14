import { pool } from '../connect.js';

export const displayController = (req, res) => {
    const username = req.query.username;

    const query = `SELECT * FROM "files" WHERE "username" = '${username}'` ;
    
    pool.connect()
        .then(client => {
            console.log('Ready to query...')

            pool.query(query, (err, result) => {
                if (err) {
                    res.status(500).send(err)
                } else {
                    res.status(200).send(result.rows)
                }
            })

            client.release()
        })
        .catch(err => {
            res.status(500).send(err)
        })
}