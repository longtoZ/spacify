import { useState, useContext, useEffect } from 'react';
import axios from 'axios';

import { SocketContext } from '../../pages/dashboard/Dashboard';
import { FilesContext } from '../../pages/dashboard/Dashboard';
import { ProgressContext } from '../../pages/dashboard/Dashboard';

import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { displayFileSize } from '../../utils/common';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';

export const Upload = ({channel_id, authentication}) => {
    const { filesUpdated, setFilesUpdated } = useContext(FilesContext);
    const [sendFile, setFile] = useState(null);

    const { socket, connectionStatus } = useContext(SocketContext);
    const { setUploadFilename, setUploadProgress } = useContext(ProgressContext);

    useEffect(() => {

        if (connectionStatus === 'open' && socket) {
    
            socket.on('uploaded_chunk', (uploadProgress) => {
                console.log(uploadProgress);
                setUploadProgress(Math.round(uploadProgress.percentage));
            });

        } else if (connectionStatus === 'disconnected') {
            console.log('Socket disconnected on upload')
        }

        return () => {
            socket.off('uploaded_chunk');
        }
        
    }, [socket])

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        console.log(e.target.files[0]);
    };

    const handleSendFile = (channel_id) => {

        if (!sendFile) {
            console.log("Please choose at least one file!")
            return;
        }

        setUploadFilename(sendFile.name);

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
                    socket_id: socket.id,
                },
            })
            .then(() => {
                setFilesUpdated(!filesUpdated);
            })
            .catch((err) => {
                console.error(err);
            });
    };

    const showModal = (e) => {
        const modal = document.querySelector('.upload-modal');
        if (modal.classList.contains('hidden')) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        } else {
            modal.classList.remove('flex');
            modal.classList.add('hidden');
        }
    }

    return (
        <div className='relative'>
            <div className='px-2 py-4 my-4 rounded-lg bg-primary-3 flex w-[10rem] cursor-pointer' onClick={showModal}>
                <AddCircleOutlineRoundedIcon/>
                <span className='ml-4'>New</span>
            </div>

            <div className='upload-modal absolute px-4 py-8 rounded-lg bg-primary-1 shadow-thick z-30 w-[24rem] flex-col items-center hidden'>
                <input type="file" id="file-input" className='hidden' onChange={handleFileChange}></input>
                <label for="file-input" className='p-2 rounded-lg bg-transparent border-2 border-dashed w-[12rem] h-[6rem]'>
                    <div className='flex flex-col h-full justify-center'>
                        <CloudUploadRoundedIcon className='text-center' style={{width:'100%'}}/>
                        <p className='text-center'>
                            Browse file
                        </p>
                    </div>

                </label>

                <ul className='w-[90%] mt-4'>
                    <li className='flex'>
                        {sendFile ? 
                        <>
                            <div className='mx-1 rounded-lg bg-primary-2 flex justify-between w-[90%]'>
                                <span className='p-2'>{sendFile.name}</span>
                                <span className='p-2'>{displayFileSize(sendFile.size)}</span>
                            </div>
                            <button
                                className="mx-1 w-[10%] block relative p-1 rounded-lg bg-[#ef44444d]"
                                onClick={() => {
                                    setFile(null)
                                }}>
                                <CloseRoundedIcon className='text-red-500 text-center'/>
                            </button>
                        </> : <></>}
                    </li>
                </ul>
                <button
                    className="rounded-lg p-2 bg-primary-3 float-right mt-8"
                    onClick={() => {
                        handleSendFile(channel_id)
                    }}>
                    Upload
                </button>
            </div>
        </div>
    );
};
