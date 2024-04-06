import axios from 'axios';
import { io } from 'socket.io-client';
import { b64toBlob } from '../../utils/common.js';

export const Display = ({ displayFiles, authentication }) => {
    const handleDownloadFile = (file_id, file_name, file_type) => {
        const socket = io('http://localhost:3000', {
            withCredentials: true,
        });

        socket.on('downloaded_chunk', (data) => {
            console.log(data);
        });

        axios
            .get('http://localhost:3000/api/download', {
                params: {
                    username: authentication.username,
                    file_id,
                    file_name,
                },
                headers: {
                    Authorization: `Bearer ${authentication.accessToken}`,
                },
            })
            .then((res) => {
                const blob = b64toBlob(res.data, file_type);

                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);

                link.download = file_name;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            })
            .then(() => {
                socket.disconnect();
            })
            .catch((err) => {
                console.error(err);
            });
    };

    const handleDeleteFile = (file_id) => {
        axios
            .get('http://localhost:3000/api/delete', {
                params: {
                    username: authentication.username,
                    file_id,
                },
                headers: {
                    Authorization: `Bearer ${authentication.accessToken}`,
                },
            })
            .then((res) => {
                console.log(res);
            })
            .catch((err) => {
                console.error(err);
            });
    };

    return (
        <div className='bg-primary-1 rounded-lg p-4 mt-[2rem]'>
            <h1 className="text-xl font-bold mb-[2rem]">Display files</h1>
            <ul>
                {displayFiles.map((file, index) => {
                    return (
                        <li
                            key={index}
                            className="flex gap-4 justify-between my-4"
                        >
                            <span>{file.file_name}</span>
                            <span>{file.file_type}</span>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    className="border-2 border-neutral-400 rounded-lg p-2 bg-neutral-200"
                                    onClick={() =>
                                        handleDownloadFile(
                                            file.file_id,
                                            file.file_name,
                                            file.file_type,
                                        )
                                    }
                                >
                                    Download
                                </button>
                                <button
                                    className="border-2 border-neutral-400 rounded-lg p-2 bg-neutral-200"
                                    onClick={() =>
                                        handleDeleteFile(file.file_id)
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
