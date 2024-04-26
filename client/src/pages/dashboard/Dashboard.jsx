import { useState, useEffect, createContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

import { SideBar } from '../../components/dashboard/SideBar';
import { Upload } from '../../components/dashboard/Upload';
import { Search } from '../../components/dashboard/Search';
import { Display } from '../../components/dashboard/Display';
import { Progress } from '../../components/progress/Progress';

import './dashboard.css';

export const FilesContext = createContext();
export const SocketContext = createContext();
export const ProgressContext = createContext();

export const Home = () => {
    const navigate = useNavigate();
    const [displayFiles, setDisplayFiles] = useState([]);
    const [filesUpdated, setFilesUpdated] = useState(false);

    const [username] = useState(localStorage.getItem('username'));
    const [channel_id] = useState(
        localStorage.getItem('channel_id'),
    );
    const [accessToken] = useState(
        localStorage.getItem('accessToken'),
    );

    const [socket, setSocket] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');

    const [uploadFilename, setUploadFilename] = useState('No upload file');
    const [downloadFilename, setDownloadFilename] = useState('No download file');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [downloadProgress, setDownloadProgress] = useState(0);

    useEffect(() => {
        const newSocket = io('http://localhost:3000');

        newSocket.on('connect', () => setConnectionStatus('open'));
        newSocket.on('disconnect', () => setConnectionStatus('closed'));
        newSocket.on('error', (error) => console.error('Socket.io error:', error));
    
        setSocket(newSocket);
    
        return () => newSocket.disconnect();
    }, [])

    // Display all stored files
    useEffect(() => {

        axios
            .get('http://localhost:3000/dashboard', {
                params: {
                    username: username,
                },
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            })
            .then((res) => {
                if (res.status === 200) {
                    setDisplayFiles(res.data);
                }
            })
            .catch((err) => {
                if (
                    err.response.status === 401 ||
                    err.response.status === 403
                ) {
                    navigate('/login');
                }
            });
    }, [filesUpdated]);

    return (
        <div className="Dashboard p-[2rem]">
            <div className='flex relative'>
				<div className='w-[14%] h-full fixed z-20'>
                    <h1 className="text-3xl font-bold mb-8">Spacify</h1>
                    <FilesContext.Provider value = {{filesUpdated, setFilesUpdated}}>
                        {connectionStatus === "open" && (
                            <SocketContext.Provider value = {{socket, connectionStatus}}>
                                <ProgressContext.Provider value = {{setUploadFilename, setUploadProgress}}>
                                    <Upload channel_id={channel_id} authentication={{username, accessToken}}/>
                                </ProgressContext.Provider>
                            </SocketContext.Provider>
                        )}
                    </FilesContext.Provider>
                    <SideBar/>
				</div>
				<div className='ml-[15%] w-[85%]'>
                    <Search/>
                    <FilesContext.Provider value = {{filesUpdated, setFilesUpdated}}>
                        {connectionStatus === "open" && (
                            <SocketContext.Provider value = {{socket, connectionStatus}}>
                                <ProgressContext.Provider value = {{setDownloadFilename, setDownloadProgress}}>
                                    <Display channel_id={channel_id} displayFiles={displayFiles} authentication={{username, accessToken}}/>
                                </ProgressContext.Provider>
                            </SocketContext.Provider>
                        )}
                    </FilesContext.Provider>
				</div>
            </div>
            <ProgressContext.Provider value = {{uploadFilename, downloadFilename, uploadProgress, downloadProgress}}>
                <Progress/>
            </ProgressContext.Provider>
        </div>
    );
};
