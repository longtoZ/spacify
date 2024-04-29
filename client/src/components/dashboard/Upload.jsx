import { useState, useContext, useEffect, useRef } from 'react';
import axios from 'axios';

import { SocketContext } from '../../pages/dashboard/Dashboard';
import { FilesContext } from '../../pages/dashboard/Dashboard';
import { ProgressContext } from '../../pages/dashboard/Dashboard';

import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { displayFileSize } from '../../utils/common';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import AddIcon from '@mui/icons-material/Add';

export const Upload = ({channel_id, folderId, authentication}) => {
    const { filesUpdated, setFilesUpdated } = useContext(FilesContext);
    const [newFile, setNewFile] = useState(null);
    const [ newFolder, setNewFolder ] = useState('');

    const { socket, connectionStatus } = useContext(SocketContext);
    const { setUploadFilename, setUploadProgress } = useContext(ProgressContext);

    const newModalRef = useRef(null);
    const uploadModalRef = useRef(null);
    const folderModalRef = useRef(null);
    const modalBackground = useRef(null);

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

    const handleFolderName = (e) => {
        setNewFolder(e.target.value.trim());
    }

    const handleFileChange = (e) => {
        setNewFile(e.target.files[0]);
        console.log(e.target.files[0]);
    };

    const handleSendFile = (channel_id) => {

        if (!newFile) {
            console.log("Please choose at least one file!")
            return;
        }

        setUploadFilename(newFile.name);

        const formData = new FormData();
        formData.append('file', newFile);

        axios
            .post('http://localhost:3000/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${authentication.accessToken}`,
                },
                params: {
                    username: authentication.username,
                    channel_id: channel_id,
                    folder_id: folderId,
                    socket_id: socket.id,
                },
            })
            .then(() => {
                setFilesUpdated(!filesUpdated);
                setUploadProgress(0);
                hideUploadModal();
            })
            .catch((err) => {
                console.error(err);
            });
    };

    const handleNewFolder = () => {

        if (newFolder === '') {
            console.log("Please enter a folder name!")
            return;
        }

        axios
            .post('http://localhost:3000/api/create_folder', {
                folder_name: newFolder,
            }, 
            {
                params: {
                    username: authentication.username,
                    parent_id: folderId,
                },
                headers: {
                    Authorization: `Bearer ${authentication.accessToken}`,
                },
            })
            .then(() => {
                setFilesUpdated(!filesUpdated);
                setNewFolder('');
                hideFolderModal();
            })
            .catch((err) => {
                console.error(err);
            });

    }

    const showUploadModal = () => {
        const modal = uploadModalRef.current;
        const background = modalBackground.current;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        background.classList.remove('hidden');
    }

    const hideUploadModal = () => {
        const modal = uploadModalRef.current;
        const background = modalBackground.current;
        modal.classList.remove('flex');
        modal.classList.add('hidden');
        background.classList.add('hidden');
    }

    const showFolderModal = () => {
        const modal = folderModalRef.current;
        const background = modalBackground.current;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        background.classList.remove('hidden');
    }

    const hideFolderModal = () => {
        const modal = folderModalRef.current;
        const background = modalBackground.current;
        modal.classList.remove('flex');
        modal.classList.add('hidden');
        background.classList.add('hidden');
    }

    const showNewModal = () => {
        const modal = newModalRef.current;
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
            <div className='px-2 py-4 my-4 rounded-lg bg-primary-3 flex w-[10rem] cursor-pointer' onClick={showNewModal}>
                <AddCircleOutlineRoundedIcon/>
                <span className='ml-4'>New</span>
            </div>

            {/* New modal */}
            <div className='absolute w-[10rem] py-4 px-2 rounded-md bg-primary-1 shadow-thick z-30 flex-col hidden' ref={newModalRef}>
                <div className='w-full p-2 rounded-md flex hover:bg-primary-1-light cursor-pointer' onClick={showUploadModal}>
                    <AddIcon className='mr-2'/>
                    <h1>New file</h1>
                </div>
                <div className='w-full p-2 rounded-md flex hover:bg-primary-1-light cursor-pointer' onClick={showFolderModal}>
                    <AddIcon className='mr-2'/>
                    <h1>New folder</h1>
                </div>
            </div>

            {/* Upload modal */}
            <div className='fixed top-0 left-0 w-[100vw] h-[100vh] z-40 bg-black opacity-50 hidden' ref={modalBackground} onClick={() => {
                hideUploadModal();
                hideFolderModal();
            }}></div>
            <div className='fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-8 rounded-lg bg-primary-1 z-50 w-[28rem] flex-col items-center hidden' ref={uploadModalRef}>
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
                        {newFile ? 
                        <>
                            <div className='mx-1 rounded-lg bg-primary-2 flex justify-between w-[90%]'>
                                <span className='p-2'>{newFile.name}</span>
                                <span className='p-2'>{displayFileSize(newFile.size)}</span>
                            </div>
                            <button
                                className="mx-1 w-[10%] block relative p-1 rounded-lg bg-[#ef44444d]"
                                onClick={() => {
                                    setNewFile(null)
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

            {/* Folder modal */}
            <div className='fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-8 rounded-lg bg-primary-1 z-50 w-[20rem] flex-col items-center hidden' ref={folderModalRef}>
                <input type="text" placeholder='Name of your folder' className='rounded-md p-2 bg-primary-1-dark' onChange={handleFolderName}/>
                <button
                    className="rounded-lg p-2 bg-primary-3 float-right mt-8"
                    onClick={handleNewFolder}>
                    Create
                </button>
            </div>
        </div>
    );
};
