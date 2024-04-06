import { useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

export const Upload = ({channel_id, authentication}) => {
    const [sendFile, setFile] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSendFile = (channel_id) => {
        const socket = io('http://localhost:3000', {
            withCredentials: true,
        });

        socket.on("uploaded_chunk", (data) => {
            console.log(data);
        });

        const formData = new FormData();
        formData.append('file', sendFile);
        axios
            .post('http://localhost:3000/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${authentication.accessToken}`,
                },
                params: {
                    username: authentication.username,
                    channel_id: channel_id,
                },
            })
            .then(() => {
                socket.disconnect();
            })
            .catch((err) => {
                console.error(err);
            });
    };

    return (
        <div>
            <h1 className="text-xl font-bold">Send file</h1>
            <input type="file" onChange={handleFileChange}></input>
            <button
                className="border-2 border-neutral-400 rounded-lg p-2 bg-neutral-200"
                onClick={() => {
                    handleSendFile(channel_id)
                }}>
                Send
            </button>
        </div>
    );
};
