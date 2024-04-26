import axios from 'axios';
import { b64toBlob } from '../../utils/common.js';
import { displayFileSize, displayDate } from '../../utils/common.js';

import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { useEffect, useContext } from 'react';

import { SocketContext } from '../../pages/dashboard/Dashboard';
import { FilesContext } from '../../pages/dashboard/Dashboard';
import { ProgressContext } from '../../pages/dashboard/Dashboard';

export const Display = ({ channel_id, displayFiles, authentication }) => {

    const { filesUpdated, setFilesUpdated } = useContext(FilesContext);
    const { socket, connectionStatus } = useContext(SocketContext);
    const { setDownloadFilename, setDownloadProgress } = useContext(ProgressContext);

    useEffect(() => {

        if (connectionStatus === 'open' && socket) {
    
            socket.on('downloaded_chunk', (downloadProgress) => {
                console.log(downloadProgress);
                setDownloadProgress(Math.round(downloadProgress.percentage));
            });
    
            // if (socket.connected) {
            //     console.log(socket)
            //     socket.emit("download_receiver", {socket_id: socket.id});
            // }
        } else if (connectionStatus === 'disconnected') {
            console.log('Socket disconnected on download')
        }

        return () => {
            socket.off('downloaded_chunk');
        }
        
    }, [socket])

    const handleDownloadFile = (channel_id, file_id, file_name, file_type) => {

        setDownloadFilename(file_name);

        axios
            .get('http://localhost:3000/api/download', {
                params: {
                    username: authentication.username,
                    channel_id,
                    file_id,
                    file_name,
                    socket_id: socket.id
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
            // .then(() => {
            //     socket.disconnect();
            // })
            .catch((err) => {
                console.error(err);
            });
    };

    const handleDeleteFile = (file_id) => {
        axios
            .get('http://localhost:3000/api/delete', {
                params: {
                    username: authentication.username,
                    channel_id,
                    file_id,
                },
                headers: {
                    Authorization: `Bearer ${authentication.accessToken}`,
                },
            })
            .then((res) => {
                console.log(res);
            })
            .then(() => {
                setFilesUpdated(!filesUpdated);
            })
            .catch((err) => {
                console.error(err);
            });
    };

    const showOptions = (e) => {
        e.target.closest('.file-item').querySelector('.option-modal').classList.toggle('hidden');
    }

    return (
        <div className=" mt-[2rem]">
            <h1 className="text-xl font-bold mb-[1rem]">Display files</h1>
            <ul className='bg-primary-1 rounded-lg p-4'>
                <li className='flex gap-4 justify-between mb-4'>
                    <span className='w-[70%] font-bold'>File name</span>
                    <span className='w-[12%] text-right font-bold'>Date</span>
                    <span className='w-[12%] text-right font-bold'>Size</span>
                    <span className='w-[6%] text-right font-bold'></span>
                </li>
                <li className='w-full mb-12 border-[#ffffffb3] border-[1px]'></li>
                {displayFiles.map((file, index) => {
                    return (
                        <li className='relative file-item'>
                            <div
                                key={index}
                                className="flex gap-4 justify-between my-4">
                                <span className="w-[70%]">{file.file_name}</span>
                                <span className="w-[12%] text-right">
                                    {displayDate(file.file_date)}
                                </span>
                                <span className="w-[12%] text-right">
                                    {displayFileSize(file.file_size)}
                                </span>
                                <span className="w-[6%] text-right cursor-pointer my-auto block" onClick={showOptions}>
                                    <MoreHorizIcon/>
                                </span>
                            </div>
                            <div className='option-modal absolute bg-primary-2 w-[15rem] rounded-lg right-0 top-3/4 z-20 hidden'>
                                <ul>
                                    <li className='cursor-pointer flex rounded-lg my-[0.5rem] mx-2 p-2 hover:bg-[#0000001f]' onClick={() => handleDownloadFile(channel_id, file.file_id, file.file_name, file.file_type)}>
                                        <FileDownloadRoundedIcon />
                                        <span className='ml-4'>Download</span>
                                    </li>
                                    <li className='cursor-pointer flex rounded-lg my-[0.5rem] mx-2 p-2 hover:bg-[#0000001f]' onClick={() => handleDeleteFile(file.file_id)}>
                                        <DeleteRoundedIcon/>
                                        <span className='ml-4'>Delete</span>
                                    </li>
                                </ul>
                            </div>
                            <div className='w-full my-4 border-transparent border-b-[#ffffff66] border-[1px]'></div>
                        </li>

                    );
                })}
            </ul>
        </div>
    );
};
