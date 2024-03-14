import { pool } from "../connect.js";
import { client } from "../index.js";
import { createTimestampString } from "../utils/common.js";

// Function to send attachment to a channel
const sendAttachment = async (channel_id, filename, file) => {
  const channel = await client.channels.fetch(channel_id);
  const message = await channel.send({
    content: "New file uploaded!",
    files: [
      {
        attachment: Buffer.from(file),
        name: filename,
      },
    ],
  });

  return {
    url: message.attachments.first().url,
    id: message.id,
  };
};

// Function to split file into chunks and return the chunk data 
const splitFile = async (channel_id, fileBuffer, file_id) => {
  const chunkSize = 1024 * 1024;
  let offset = 0;
  let chunkNumber = 1;
  const chunk_data = [];

  while (offset < fileBuffer.length) {
    const chunk = fileBuffer.slice(offset, offset + chunkSize);
    const outputFilePath = file_id + "_" + chunkNumber + ".txt";

    // fs.writeFileSync(outputFilePath, chunk);

    const file_info = await sendAttachment(channel_id, outputFilePath, chunk);
    console.log(file_info);
    chunk_data.push({
      chunkNumber,
      file_url: file_info.url,
      message_id: file_info.id,
    });

    offset += chunkSize;
    chunkNumber++;
  }

  return chunk_data;
};

// Function to post file data to the "files" table
const postFileData = (res, username, file_id, folder_id, file_name, file_type, chunk_data) => {
  const query_files =
    `INSERT INTO "files" (username, file_id, folder_id, file_name, file_type) VALUES ('${username}', '${file_id}', '${folder_id}', '${file_name}', '${file_type}');`;
  
    pool.connect()
    .then(client => {
      console.log('Ready to post to "files"...')
      pool.query(query_files, (err, result) => {
        if (err) {
          res.status(500).send(err)
        } else {
          const query_datas =
          `INSERT INTO "datas" (username, file_id, chunk, file_url, message_id) VALUES` +
          
          chunk_data
            .map(
              (chunk) =>
                `('${username}', '${file_id}', ${chunk.chunkNumber}, '${chunk.file_url}', '${chunk.message_id}')`
            )
            .join(", ") +
          ";";

          pool.query(query_datas, (err, result) => {
            if (err) {
              res.status(500).send(err)
            } else {
              res.status(200).send('File uploaded successfully!')
            }
          })
        }
      })

      client.release()
    })
    .catch(err => {
      res.status(500).send(err)
    })
};

// Controller to handle file upload
export const uploadController = (req, res) => {
  const username = req.query.username;
  const channel_id = req.query.channel_id;

  const file = req.file;
  const file_name = file.originalname;
  const file_type = file.mimetype;
  const file_id =
    createTimestampString() +
    "_" +
    file_name.substr(0, file_name.lastIndexOf("."));

  splitFile(channel_id, file.buffer.toString("base64"), file_id)
    .then((chunk_data) => {
      postFileData(res, username, file_id, "", file_name, file_type, chunk_data);
    })

};
