import { db } from '../connect.js'

export const displayController = (req, res) => {
    const username = req.query.username;

    const query = "SELECT * FROM `files` WHERE `username` = '" + username + "';";
    db.query(query, (err, result) => {
        if (err) {
            res.status(500).send("Internal Server Error");
        } else {
            res.status(200).send(result);
        }
    })
}