import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { b64toBlob } from "../../utils/common.js";

export const Home = () => {
  const navigate = useNavigate();
  const [sendFile, setFile] = useState(null);
  const [displayFiles, setDisplayFiles] = useState([]);

  const [username, setUsername] = useState(localStorage.getItem("username"));
  const [channel_id, setChannelId] = useState(localStorage.getItem("channel_id"));
  const [accessToken, setAccessToken] = useState(localStorage.getItem("accessToken"));

  // Display all stored files
  useEffect(() => {
    axios
      .get("http://localhost:3000/dashboard", {
        params: {
          username: username,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        }
      })
      .then((res) => {
        if (res.status === 200) {
          setDisplayFiles(res.data);
        }
      })      
      .catch((err) => {
        if (err.response.status === 401) {
          navigate("/login");
        }
      });
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSendFile = (e) => {
    try {
      const formData = new FormData();
      formData.append("file", sendFile);
      axios.post("http://localhost:3000/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          username: username,
          channel_id: channel_id,
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadFile = (file_id, file_name, file_type) => {
    axios
      .get("http://localhost:3000/api/download", {
        params: {
          username: username,
          file_id,
          file_name,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        }
      })
      .then((res) => {
        const blob = b64toBlob(res.data, file_type);

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        
        link.download = file_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleDeleteFile = (file_id) => {
    axios
      .get("http://localhost:3000/api/delete", {
        params: {
          username: username,
          file_id,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        }
      })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  return (
    <div className="Dashboard px-[10%]">
            <h1 className="text-xl font-bold">Send file</h1>
      <input type="file" onChange={handleFileChange}></input>
      <button className="border-2 border-neutral-400 rounded-lg p-2 bg-neutral-200" onClick={handleSendFile}>Send</button>

      <h1 className="text-xl font-bold mt-[5rem]">Display files</h1>
      <ul>
        {displayFiles.map((file, index) => {
          return (
            <li key={index} className="flex gap-4 justify-between my-4">
              <span>{file.file_name}</span>
              <span>{file.file_type}</span>
              <div className="grid grid-cols-2 gap-4">
                <button
                  className="border-2 border-neutral-400 rounded-lg p-2 bg-neutral-200"
                  onClick={() =>
                    handleDownloadFile(
                      file.file_id,
                      file.file_name,
                      file.file_type
                    )
                  }
                >
                  Download
                </button>
                <button
                  className="border-2 border-neutral-400 rounded-lg p-2 bg-neutral-200"
                  onClick={() =>
                    handleDeleteFile(
                      file.file_id
                    )
                  }
                >
                  Delete
                </button>
              </div>

            </li>
          );
        })}
      </ul>
    </div>
  );
};
