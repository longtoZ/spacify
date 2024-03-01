import { db } from '../connect.js';
import { client } from "../index.js";
import { createTimestampString } from "../utils/common.js";

const channelId = "716609024505675778";

const sendAttachment = async (channelId, filename, file) => {
  const channel = await client.channels.fetch(channelId);
  const message = await channel.send({
      content: "New file uploaded!",
      files: [{
          attachment: Buffer.from(file),
          name: filename
      }],
  })

  return {
    url: message.attachments.first().url,
    id: message.id
  };

}

const splitFile = async (fileBuffer, file_id) => {
  const chunkSize = 1024 * 1024;
  let offset = 0;
  let chunkNumber = 1;
  const chunk_data = [];

  while (offset < fileBuffer.length) {
      const chunk = fileBuffer.slice(offset, offset + chunkSize).toString('utf-8');
      const outputFilePath = file_id + "_" + chunkNumber + ".txt";

      // fs.writeFileSync(outputFilePath, chunk);

      const file_info = await sendAttachment(channelId, outputFilePath, chunk);
      console.log(file_info)
      chunk_data.push({ chunkNumber, file_url: file_info.url, message_id: file_info.id});

      offset += chunkSize;
      chunkNumber++;
  }

  return chunk_data;
}

const postFileData = (file_id, folder_id, file_name, file_type) => {
  const query = "INSERT INTO `files` (`username`, `file_id`, `folder_id`, `file_name`, `file_type`) VALUES" + `('Nautilus', '${file_id}', '${folder_id}', '${file_name}', '${file_type}')` + ";";
  db.query(query, (err, result) => {
    if (err) {
      console.log(err);
    }
  });
}

const postChunkData = (chunk_data, file_id) => {
  const query = "INSERT INTO `datas` (`username`, `file_id`, `chunk`, `file_url`, `message_id`) VALUES" + chunk_data.map((chunk) => `('Nautilus', '${file_id}', ${chunk.chunkNumber}, '${chunk.file_url}', '${chunk.message_id}')`).join(', ') + ";";
  console.log(query)
  db.query(query, (err, result) => {
    if (err) {
      console.log(err);
    }
  });
}

export const uploadController = (req, res) => {
  const file = req.file;
  const file_name = file.originalname;
  const file_type = file.mimetype;
  const file_id = createTimestampString() + '_' + file_name.substr(0, file_name.lastIndexOf('.'))

  splitFile(file.buffer, file_id).then((chunk_data) => {
    postFileData(file_id, '', file_name, file_type)
    return chunk_data
  }).then((chunk_data) => {
    postChunkData(chunk_data, file_id)
  })

};
