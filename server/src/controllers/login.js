import { pool } from '../connect.js';
import jwt from 'jsonwebtoken';

export const loginController = (req, res) => {
    const { username, password } = req.body;

    const query = `SELECT * FROM "users" WHERE "username" = '${username}' AND "password" = '${password}'`;

    pool.connect()
        .then(client => {
            console.log('Ready to query...')

            pool.query(query, (err, result) => {
                if (err) {
                    res.status(500).send(err)
                } else {
                    if (result.rows.length > 0) {
                        const accessToken = jwt.sign({ username: username }, process.env.SECRET_TOKEN);
                        const channel_id = result.rows[0].channel_id;
                        
                        res.status(200).json({
                            username,
                            channel_id,
                            accessToken
                        })

                    } else {
                        res.status(401).send('Login failed')
                    }
                }
            })

            client.release()
        })
        .catch(err => {
            res.status(500).send(err)
        })
}