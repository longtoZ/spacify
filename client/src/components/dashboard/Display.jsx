import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { b64toBlob } from '../../utils/common.js';
import { displayFileSize, displayDate } from '../../utils/common.js';

import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';

import { SocketContext } from '../../pages/dashboard/Dashboard';
import { FilesContext } from '../../pages/dashboard/Dashboard';
import { ProgressContext } from '../../pages/dashboard/Dashboard';

export const Display = ({ channel_id, folderId, folderPath, displayFiles, authentication }) => {

    const navigate = useNavigate();

    const { filesUpdated, setFilesUpdated } = useContext(FilesContext);
    const { socket, connectionStatus } = useContext(SocketContext);
    const { setDownloadFilename, setDownloadProgress } = useContext(ProgressContext);

    // Socket event listener for download progress
    useEffect(() => {

        console.log(displayFiles)

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

    const handleDownloadFile = (folder_id, file_id, file_name, file_type) => {

        setDownloadFilename(file_name);

        axios
            .get('http://localhost:3000/api/download', {
                params: {
                    username: authentication.username,
                    channel_id,
                    folder_id,
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

    const handleDeleteFile = (folder_id, file_id) => {
        axios
            .delete('http://localhost:3000/api/delete', {
                params: {
                    username: authentication.username,
                    channel_id,
                    folder_id,
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

    const handleDeleteFolder = (folder_id) => {
        axios
            .delete('http://localhost:3000/api/delete_folder', {
                params: {
                    username: authentication.username,
                    folder_id,
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
    }

    const showFileOptions = (e) => {
        const option = e.target.closest('.file-item').querySelector('.option-modal');
        
        if (option.style.height === '0px' || option.style.height === '') {
            option.style.height = '3.5rem';
        } else {
            option.style.height = '0';
        }
    }

    const showFolderOptions = (e) => {
        const option = e.target.closest('.folder-item').querySelector('.option-modal');
        
        if (option.style.height === '0px' || option.style.height === '') {
            option.style.height = '3.5rem';
        } else {
            option.style.height = '0';
        }
    }

    return (
        <div className=" mt-[2rem]">
            <div className='flex flex-row items-center mb-[1rem]'>
                {folderPath && folderPath.map((folder, index) => {
                    return (
                        <>
                            <div className="text-xl font-bold p-2 mx-1 rounded-lg cursor-pointer hover:bg-primary-1-light" 
                            onClick={() => {
                                const fullId = folder.folder_id;
                                const id = fullId.substr(fullId.indexOf('_', 0) + 1)

                                navigate(`/dashboard/${id}`)
                            }} 
                            style={{transition: 'all ease 0.1s'}}>
                                {folder.folder_name}
                            </div>
                            <div>
                                {index !== folderPath.length - 1 && <KeyboardArrowRightRoundedIcon/>}
                            </div>
                        </>
                        
                    )
                })}
            </div>

            <ul className='bg-primary-1 rounded-lg p-4'>
                <li className='flex gap-4 justify-between mb-4'>
                    <span className='w-[70%] font-bold'>Name</span>
                    <span className='w-[12%] text-right font-bold'>Last updated</span>
                    <span className='w-[12%] text-right font-bold'>Size</span>
                    <span className='w-[6%] text-right font-bold'></span>
                </li>
                <li className='w-full mb-12 border-[#ffffffb3] border-[1px]'></li>

                {displayFiles.folders && displayFiles.folders.map((folder, index) => {
                    return (
                        <li className='relative folder-item'>
                            <div
                                key={index}
                                className="flex gap-4 justify-between my-4">
                                <div className='cursor-pointer w-[70%]' onClick={() => {
                                    const fullId = folder.folder_id;
                                    const id = fullId.substr(fullId.indexOf('_', 0) + 1)

                                    navigate(`/dashboard/${id}`)
                                }}>
                                    <FolderRoundedIcon className='mr-2'/>
                                    <span>{folder.folder_name}</span>
                                </div>
                                <span className="w-[12%] text-right">
                                    {displayDate(folder.folder_date)}
                                </span>
                                <span className="w-[12%] text-right">
                                    -
                                </span>
                                <span className="w-[6%] text-right cursor-pointer my-auto block" onClick={showFolderOptions}>
                                    <MoreHorizIcon/>
                                </span>
                            </div>
                            <div className='option-modal w-full h-0 rounded-lg flex flex-row-reverse z-20 overflow-hidden' style={{transition:'all ease 0.2s'}}>
                                <div className='cursor-pointer flex rounded-lg my-[0.5rem] mx-2 p-2 hover:bg-[#0000001f]' onClick={() => handleDeleteFolder(folder.folder_id)}>
                                    <DeleteRoundedIcon/>
                                    <span className='ml-4'>Delete</span>
                                </div>

                                </div>
                            <div className='w-full my-4 border-transparent border-b-[#ffffff66] border-[1px]'></div>
                        </li>
                    )
                })}
                {displayFiles.files && displayFiles.files.map((file, index) => {
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
                                <span className="w-[6%] text-right cursor-pointer my-auto block" onClick={showFileOptions}>
                                    <MoreHorizIcon/>
                                </span>
                            </div>
                            <div className='option-modal w-full h-0 rounded-lg flex flex-row-reverse z-20 overflow-hidden' style={{transition:'all ease 0.2s'}}>

                                <div className='cursor-pointer flex rounded-lg my-[0.5rem] mx-2 p-2 hover:bg-[#0000001f]' onClick={() => handleDownloadFile(file.folder_id, file.file_id, file.file_name, file.file_type)}>
                                    <FileDownloadRoundedIcon />
                                    <span className='ml-4'>Download</span>
                                </div>
                                <div className='cursor-pointer flex rounded-lg my-[0.5rem] mx-2 p-2 hover:bg-[#0000001f]' onClick={() => handleDeleteFile(file.folder_id, file.file_id)}>
                                    <DeleteRoundedIcon/>
                                    <span className='ml-4'>Delete</span>
                                </div>

                            </div>
                            <div className='w-full my-4 border-transparent border-b-[#ffffff66] border-[1px]'></div>
                        </li>

                    );
                })}
            </ul>
        </div>
    );
};
