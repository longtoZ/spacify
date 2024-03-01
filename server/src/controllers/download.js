import { db } from "../connect.js";

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

export const downloadController = (req, res) => {
  const username = req.query.username;
  const file_id = req.query.file_id;
  const file_name = req.query.file_name;

  const query =
    "SELECT * FROM `datas` WHERE `username` = '" +
    username +
    "' AND `file_id` = '" +
    file_id +
    "' ORDER BY `chunk` ASC;";
  db.query(query, (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      const fileUrls = result.map((file) => file.file_url);

      // Use Promise.all to fetch content from all URLs simultaneously
      Promise.all(fileUrls.map(fetchFileContent))
        .then(async (contents) => {
          // Merge the contents into one text file
          const mergedContent = contents.join("\n");

          res.setHeader(
            "Content-Disposition",
            "attachment; filename=" + file_name
          );
          res.setHeader("Content-Type", "text/plain");

          // Send the merged content directly in the response
          res.send(mergedContent);

        })
        .catch((error) => {
          console.error("Error fetching file content:", error);
        });
    }
  });
};
