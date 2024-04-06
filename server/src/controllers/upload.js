import { pool } from "../connect.js";
import { client, io } from "../index.js";
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
const splitAndSendFile = async (socket, channel_id, fileBuffer, file_id) => {
  const chunkSize = 1024 * 1024;
  let offset = 0;
  let chunkNumber = 1;
  const chunk_data = [];

  while (offset < fileBuffer.length) {
    const chunk = fileBuffer.slice(offset, offset + chunkSize);
    const outputFilePath = file_id + "_" + chunkNumber + ".txt";

    const file_info = await sendAttachment(channel_id, outputFilePath, chunk);
    console.log(file_info);

    // Send progress to client
    socket.emit("uploaded_chunk", {
      percentage: `${(offset + chunkSize) / fileBuffer.length}`,
    })

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

// Function to post file data to table
const postFileData = async (res, username, file_id, folder_id, file_name, file_type, file_size, file_date, chunk_data) => {
  const query_files =
    `INSERT INTO "files" (username, file_id, folder_id, file_name, file_type, file_size, file_date) VALUES ('${username}', '${file_id}', '${folder_id}', '${file_name}', '${file_type}', '${file_size}', '${file_date}');`;
  const query_datas =
  `INSERT INTO "datas" (username, file_id, chunk, file_url, message_id) VALUES` +
  chunk_data
    .map(
      (chunk) =>
        `('${username}', '${file_id}', ${chunk.chunkNumber}, '${chunk.file_url}', '${chunk.message_id}')`
    )
    .join(", ") +
  ";";

  // Connect to the database
  const client = await pool.connect()
  console.log("Connected to database");

  // Insert into the "files" table
  const queryFiles = await pool.query(query_files)
  if (queryFiles.rowCount === 0) {
    res.status(500).send("Failed to upload file data")
  }

  // Insert into the "datas" table
  const queryDatas = await pool.query(query_datas)
  if (queryDatas.rowCount === 0) {
    res.status(500).send("Failed to upload file data")
  } else {
    res.status(200).send("File uploaded successfully")
  }

  client.release()

};

// Controller to handle file upload
export const uploadController = (req, res) => {
	const username = req.query.username;
	const channel_id = req.query.channel_id;
	const timestampString = createTimestampString();

	const file = req.file;
	const file_name = file.originalname;
	const file_type = file.mimetype;
	const file_size = file.size;
	const file_date = timestampString;
	const file_id =
	timestampString +
	"_" +
	file_name.substr(0, file_name.lastIndexOf("."));

	console.log(file);

	// Socket connection for uploading files
	io.on("connection", async (socket) => {
		const chunk_data = await splitAndSendFile(socket, channel_id, file.buffer.toString("base64"), file_id)
		const file_data = await postFileData(res, username, file_id, "", file_name, file_type, file_size, file_date, chunk_data);
		socket.disconnect();
	})
}