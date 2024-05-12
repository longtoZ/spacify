import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { b64toBlob } from '../../utils/common.js';
import { displayFileSize, displayDate } from '../../utils/common.js';

import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import { SocketContext } from '../../pages/dashboard/Dashboard';
import { FilesContext } from '../../pages/dashboard/Dashboard';
import { ProgressContext } from '../../pages/dashboard/Dashboard';

export const Display = ({ channel_id, folderId, folderPath, displayFiles, authentication }) => {

    const navigate = useNavigate();

    const { filesUpdated, setFilesUpdated } = useContext(FilesContext);
    const { socket, connectionStatus } = useContext(SocketContext);
    const { downloadFiles, setDownloadFiles } = useContext(ProgressContext);

    const [ctrlKeyPressed, setCtrlKeyPressed] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [selectedFolders, setSelectedFolders] = useState([]);

    const selectPannelRef = useRef(null);
    const downloadMutipleRef = useRef(null);

    // Socket event listener for download progress
    useEffect(() => {

        console.log(displayFiles)

        if (connectionStatus === 'open' && socket) {
    
            socket.on('downloaded_chunk', (downloadProgress) => {
                console.log(downloadProgress);
                // Update the progress of the file being uploaded
                setDownloadFiles(prevFile => {
                    const updatedFile = [...prevFile];
                    updatedFile[downloadProgress.order].percentage = downloadProgress.percentage;
                    return updatedFile;
                });
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

    // Ctrl key event listener for choosing multiple files
    useEffect(() => {
        
        const handleKeyDown = (e) => {
            if (e.ctrlKey) {
                setCtrlKeyPressed(true);
            }
        }

        const handleKeyUp = (e) => {
            if (!e.ctrlKey) {
                setCtrlKeyPressed(false);
            }
        }

        document.addEventListener('keydown', handleKeyDown)

        document.addEventListener('keyup', handleKeyUp)

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        }
    }, [])

    // Log selected files and folders
    useEffect(() => {
        console.log({
            selectedFiles,
            selectedFolders
        })

        if (selectedFiles.length === 0 && selectedFolders.length === 0) {
            selectPannelRef.current.style.display = 'none';

            document.querySelectorAll('li[file-id]').forEach((i) => {
                i.classList.remove('selected');
            })

            document.querySelectorAll('li[folder-id]').forEach((i) => {
                i.classList.remove('selected');
            })
        } else {
            selectPannelRef.current.style.display = 'flex';

            // Not allow to download folder(s)
            if (selectedFolders.length !== 0) {
                downloadMutipleRef.current.classList.add('download-multiple-blocked')
            } else {
                downloadMutipleRef.current.classList.remove('download-multiple-blocked')
            }
        }

        handleMultipleFilesSelect(selectedFiles);

    }, [selectedFiles, selectedFolders])

    const handleFileDownload = async (folder_id, file_id, file_name, file_type, order) => {

        try {
            const response = await axios.get('http://localhost:3000/api/download', {
                params: {
                    username: authentication.username,
                    channel_id,
                    folder_id,
                    file_id,
                    file_name,
                    socket_id: socket.id,
                    order,
                },
                headers: {
                    Authorization: `Bearer ${authentication.accessToken}`,
                },
            })
            
            const blob = b64toBlob(response.data, file_type);

            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);

            link.download = file_name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error(err);
        }

    };

    const handleMulitpleFilesDownload = async () => {

        for (let i = 0; i < downloadFiles.length; i++) {

            console.log(downloadFiles[i])

            await handleFileDownload(downloadFiles[i].data.folder_id, downloadFiles[i].data.file_id, downloadFiles[i].data.file_name, downloadFiles[i].data.file_type, i);
        }
    }

    const handleFileDelete = async (folder_id, file_id) => {
        try {
            const response = await axios.delete('http://localhost:3000/api/delete', {
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
            
            console.log(response);
            setFilesUpdated(!filesUpdated);
        } catch (err) {
            console.error(err);
        }
    };

    const handleFolderDelete = async (folder_id) => {

        try {
            const response = await axios.delete('http://localhost:3000/api/delete_folder', {
                    params: {
                        username: authentication.username,
                        folder_id,
                    },
                    headers: {
                        Authorization: `Bearer ${authentication.accessToken}`,
                    },
                })
            
            console.log(response);
            setFilesUpdated(!filesUpdated);
                
        } catch (err) {
            console.error(err);
        }
    }

    const handleMultipleDelete = async () => {
        for (let i = 0; i < selectedFolders.length; i++) {
            await handleFolderDelete(selectedFolders[i].folder_id);
        }

        for (let i = 0; i < selectedFiles.length; i++) {
            await handleFileDelete(selectedFiles[i].folder_id, selectedFiles[i].file_id);
        }

        setSelectedFiles([]);
        setSelectedFolders([]);
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

    const handleFileSelect = (file) => {
        if (ctrlKeyPressed) {
            if (selectedFiles.includes(file)) {
                document.querySelector(`[file-id="${file.file_id}"]`).classList.remove('selected');
                setSelectedFiles(selectedFiles.filter((f) => f.file_id !== file.file_id));
            } else {
                document.querySelector(`[file-id="${file.file_id}"]`).classList.add('selected');
                setSelectedFiles([...selectedFiles, file]);
            }
        }
    }

    const handleFolderSelect = (folder) => {
        if (ctrlKeyPressed) {
            if (selectedFolders.includes(folder)) {
                document.querySelector(`[folder-id="${folder.folder_id}"]`).classList.remove('selected');
                setSelectedFolders(selectedFolders.filter((f) => f.folder_id !== folder.folder_id));
            } else {
                document.querySelector(`[folder-id="${folder.folder_id}"]`).classList.add('selected');
                setSelectedFolders([...selectedFolders, folder]);
            }
        }
    }

    const handleMultipleFilesSelect = (selectedFiles) => {
        const files = [];

        for (let i = 0; i < selectedFiles.length; i++) {
            files.push({
                data: selectedFiles[i],
                percentage: 0
            });
        }

        setDownloadFiles(files);
    }

    return (
        <div className="Display mt-[2rem]">
            <div className='w-full h-[2.5rem] flex items-center rounded-xl bg-primary-2 px-2 mb-[1rem] py-1' ref={selectPannelRef}>
                <CloseRoundedIcon className='hover:cursor-pointer' onClick={() => {
                    setSelectedFiles([]);
                    setSelectedFolders([])
                }}/>
                <div className='w-[25%] grid grid-cols-2 gap-2 text-center'>
                    <h1>
                        {selectedFiles.length} file(s) selected
                    </h1>
                    <h1>
                        {selectedFolders.length} folder(s) selected
                    </h1>
                </div>
                <div className='ml-[2rem] grid grid-cols-2 gap-4 text-center'>
                    <FileDownloadRoundedIcon className='hover:cursor-pointer' style={{fontSize:'1.4rem'}} ref={downloadMutipleRef} onClick={handleMulitpleFilesDownload}/>
                    <DeleteRoundedIcon className='hover:cursor-pointer' style={{fontSize:'1.4rem'}} onClick={handleMultipleDelete}/>
                </div>
            </div>

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
                        <li className='relative folder-item' style={{transition:'all ease 0.2s'}} onClick={() => {handleFolderSelect(folder)}} key={folder.id} folder-id={folder.folder_id}>
                            <div
                                key={index}
                                className="flex gap-4 justify-between py-6 px-2">
                                <div className='w-[70%]'>
                                    <span className='cursor-pointer' onClick={(e) => {
                                        e.preventDefault();

                                        if (!e.ctrlKey) {
                                            const fullId = folder.folder_id;
                                            const id = fullId.substr(fullId.indexOf('_', 0) + 1)
    
                                            navigate(`/dashboard/${id}`)
                                        }

                                    }}>
                                        <FolderRoundedIcon className='mr-2'/>
                                        <span>{folder.folder_name}</span>
                                    </span>
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
                                <div className='cursor-pointer flex rounded-lg my-[0.5rem] mx-2 p-2 hover:bg-[#0000001f] text-text-tomato' onClick={() => handleFolderDelete(folder.folder_id)}>
                                    <DeleteRoundedIcon/>
                                    <span className='ml-4'>Delete</span>
                                </div>

                                </div>
                            <div className='w-full border-transparent border-b-[#ffffff66] border-[1px]'></div>
                        </li>
                    )
                })}

                {displayFiles.files && displayFiles.files.map((file, index) => {
                    return (
                        <li className='relative file-item' style={{transition:'all ease 0.2s'}} onClick={() => {handleFileSelect(file)}} key={file.id} file-id={file.file_id}>
                            <div
                                key={index}
                                className="flex gap-4 justify-between py-6 px-2">
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

                                <div className='cursor-pointer flex rounded-lg my-[0.5rem] mx-2 p-2 hover:bg-[#0000001f] text-text-light-teal' onClick={() => handleFileDownload(file.folder_id, file.file_id, file.file_name, file.file_type)}>
                                    <FileDownloadRoundedIcon />
                                    <span className='ml-4'>Download</span>
                                </div>
                                <div className='cursor-pointer flex rounded-lg my-[0.5rem] mx-2 p-2 hover:bg-[#0000001f] text-text-tomato' onClick={() => handleFileDelete(file.folder_id, file.file_id)}>
                                    <DeleteRoundedIcon/>
                                    <span className='ml-4'>Delete</span>
                                </div>

                            </div>
                            <div className='w-full border-transparent border-b-[#ffffff66] border-[1px]'></div>
                        </li>

                    );
                })}
            </ul>
        </div>
    );
};
