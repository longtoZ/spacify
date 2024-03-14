import { pool } from "../connect.js";
import { client } from "../index.js";

const channelId = "716609024505675778";

const deleteServerMessage = async (channelId, file_id) => {
  const channel = await client.channels.fetch(channelId);
  const query =
    `SELECT * FROM "datas" WHERE "username" = 'Nautilus' AND "file_id" = '${file_id}';`
  pool.connect()
    .then(client => {
      console.log('Ready to delete...')

      pool.query(query, (err, result) => {
        if (err) {
          res.status(500).send(err)
        } else {
          result.rows.forEach(async (i) => {
            await channel.messages.delete(i.message_id);
          })
        }
      })

      client.release()
  });
}

const deleteDatabaseMessage = (res, username, file_id) => {
  const query =
    `DELETE FROM "files" WHERE "username" = '${username}' AND "file_id" = '${file_id}';`;
  
  pool.connect()
    .then(client => {
      console.log('Ready to delete...')

      pool.query(query, (err, result) => {
        if (err) {
          res.status(500).send(err)
        } else {
          res.status(200).send('File deleted successfully!')
        }
      })

      client.release()
    })
};

export const deleteController = (req, res) => {
  const username = req.query.username;
  const file_id = req.query.file_id;

  deleteServerMessage(channelId, file_id).then(() => {
    deleteDatabaseMessage(res, username, file_id);
  });
};
