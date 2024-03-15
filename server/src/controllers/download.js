import { io } from "../index.js";
import { pool } from "../connect.js";

// Function to fetch content from a single URL
async function fetchFileContent(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`);
  } else {
    console.log(`Fetched ${url}`);

  }
  return response.text();
}

function mergeFileContent(res, content, file_name) {
    // Merge the contents into one text file
    const mergedContent = content.join("\n");

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + file_name
    );
    res.setHeader("Content-Type", "application/octet-stream");

    // Send the merged content directly in the response
    res.send(mergedContent);
}

async function downloadFile(res, socket, username, file_id, file_name) {
  const content = []
  const query =
    `SELECT * FROM "datas" WHERE "username" = '${username}' AND "file_id" = '${file_id}' ORDER BY "chunk" ASC;`;
  
  const client = await pool.connect()
  console.log("Connected to database for download");

  const queryFiles = await pool.query(query)
  if (queryFiles.rowCount === 0) {
    res.status(500).send("Failed to download file data")
  } else {
    const fileUrls = queryFiles.rows.map((file) => file.file_url);

    for (let index = 0; index < fileUrls.length; index++) {
      const text = await fetchFileContent(fileUrls[index]);

      // Send progress to client
      socket.emit("downloaded_chunk", {
        percentage: `${(index + 1) / (fileUrls.length)}`,
      })

      content.push(text);
    }

    mergeFileContent(res, content, file_name);

  }

  client.release();
}

// Controller to handle file download
export const downloadController = (req, res) => {
  const username = req.query.username;
  const file_id = req.query.file_id;
  const file_name = req.query.file_name;

  // Socket connection for downloading files
  io.on("connection", async (socket) => {
    await downloadFile(res, socket, username, file_id, file_name);
    socket.disconnect();
  });
};