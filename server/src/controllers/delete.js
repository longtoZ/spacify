import { db } from "../connect.js";
import { client } from "../index.js";

const channelId = "716609024505675778";

const deleteServerMessage = async (channelId, file_id) => {
  const channel = await client.channels.fetch(channelId);
  const query =
    "SELECT * FROM `datas` WHERE `username` = 'Nautilus' AND `file_id` = '" +
    file_id +
    "';";
  console.log(query);
  db.query(query, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      result.forEach((i) => {
        channel.messages.delete(i.message_id);
        console.log("Deleted ", i.message_id);
      });
    }
  });
};

const deleteDatabaseMessage = (username, file_id) => {
  const query =
    "DELETE FROM `files` WHERE `username` = '" +
    username +
    "' AND `file_id` = '" +
    file_id +
    "';";
  db.query(query, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Deleted");
    }
  });
};

export const deleteController = (req, res) => {
  const username = req.query.username;
  const file_id = req.query.file_id;

  deleteServerMessage(channelId, file_id).then(() => {
    deleteDatabaseMessage(username, file_id);
  });
};
