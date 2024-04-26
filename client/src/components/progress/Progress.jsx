import { useRef, useState, useContext } from 'react';

import { ProgressContext } from '../../pages/dashboard/Dashboard';

import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

export const Progress = () => {

    const [progressOpen, setProgressOpen] = useState(true);
    const [currentMode, setCurrentMode] = useState('upload');

    const progressRef = useRef(null);
    const arrowIconRef = useRef(null);
    const uploadModeRef = useRef(null);
    const downloadModeRef = useRef(null);

    const { uploadFilename, downloadFilename, uploadProgress, downloadProgress } = useContext(ProgressContext);

    const minimize = () => {
        if (progressOpen) {
            progressRef.current.style.height = '0';
            progressRef.current.style.margin = '0';
            arrowIconRef.current.style.transform = 'rotate(180deg)';
        } else {
            progressRef.current.style.height = '6.5rem';
            progressRef.current.style.margin = '0.5rem 0';
            arrowIconRef.current.style.transform = 'rotate(0deg)';
        }

        setProgressOpen(!progressOpen);
    }

    const switchMode = (e) => {
        if (e.target.closest('.mode-btn').classList.contains('upload-mode')) {
            uploadModeRef.current.classList.add('file-stream-select');
            downloadModeRef.current.classList.remove('file-stream-select');
            setCurrentMode('upload');
        } else if (e.target.closest('.mode-btn').classList.contains('download-mode')) {
            downloadModeRef.current.classList.add('file-stream-select');
            uploadModeRef.current.classList.remove('file-stream-select');
            setCurrentMode('download');
        }
    }

    return (
        <div className="absolute right-8 bottom-4 z-[20]">
            <div className="overflow-hidden rounded-md bg-primary-1 shadow-thick w-[20rem]">
                <div className="w-full px-2 bg-primary-2 h-[2rem] cursor-pointer flex justify-between items-center relative" onClick={minimize}>
                    <h1>Filestream pannel</h1>
                    <KeyboardArrowDownRoundedIcon ref={arrowIconRef}/>
                </div>
                <div className="w-full h-[6.5rem] px-4 my-2" ref={progressRef} style={{transition:"all ease 0.2s"}}>
                    <div className='w-[10rem] grid grid-cols-2 text-sm bg-primary-1-dark rounded-md'>
                        <div className='m-1 p-1 rounded-md cursor-pointer mode-btn upload-mode file-stream-select' ref={uploadModeRef} onClick={switchMode}>
                            <h1 className='flex justify-center'>Upload</h1>
                        </div>
                        <div className='m-1 p-1 rounded-md cursor-pointer mode-btn download-mode' ref={downloadModeRef} onClick={switchMode}>
                            <h1 className='flex justify-center'>Download</h1>
                        </div>
                    </div>
                    
                    {currentMode === 'upload' ? (
                        <>
                            <h1 className="text-sm mt-4">{uploadFilename}</h1>
                            <div className="flex items-center">
                                <div className="rounded-md overflow-hidden h-[0.5rem] w-[90%] bg-[#093333]">
                                    <div
                                        className='rounded-md bg-primary-3 h-full' style={{width:`${Math.round(uploadProgress)}%`, transition:"all ease-out 0.2s"}}></div>
                                </div>
                                <div className="w-[10%] flex justify-center">
                                    <CancelOutlinedIcon
                                        className="opacity-50 hover:text-red-400 cursor-pointer"
                                        style={{ transition: 'all ease 0.1s' }}
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <h1 className="text-sm mt-4">{downloadFilename}</h1>
                            <div className="flex items-center">
                                <div className="rounded-md overflow-hidden h-[0.5rem] w-[90%] bg-[#093333]">
                                    <div
                                        className='rounded-md bg-primary-3 h-full' style={{width:`${Math.round(downloadProgress)}%`, transition:"all ease-out 0.2s"}}></div>
                                </div>
                                <div className="w-[10%] flex justify-center">
                                    <CancelOutlinedIcon
                                        className="opacity-50 hover:text-red-400 cursor-pointer"
                                        style={{ transition: 'all ease 0.1s' }}
                                    />
                                </div>
                            </div> 
                        </>
                    )}

                </div>
            </div>
        </div>
    );
};
