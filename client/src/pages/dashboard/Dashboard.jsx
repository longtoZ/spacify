import { useState, useEffect, createContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

import { SideBar } from '../../components/dashboard/SideBar';
import { Upload } from '../../components/dashboard/Upload';
import { SearchBar } from '../../components/dashboard/SearchBar';
import { Display } from '../../components/dashboard/Display';
import { Progress } from '../../components/progress/Progress';
import { ProfileIcon } from '../../components/dashboard/ProfileIcon';

import './dashboard.css';

export const FilesContext = createContext();
export const SocketContext = createContext();
export const ProgressContext = createContext();

export const Dashboard = () => {
    const { folderId } = useParams();

    const navigate = useNavigate();
    const location = useLocation();

    const [displayFiles, setDisplayFiles] = useState({});
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

    const [uploadFiles, setUploadFiles] = useState([]);
    const [downloadFiles, setDownloadFiles] = useState([]);
    const [folderPath, setFolderPath] = useState([]);

    // Get full path of current folder
    useEffect(() => {
        axios
            .get('http://localhost:3000/api/path', {
                params: {
                    username: username,
                    folder_id: folderId,
                },
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            })
            .then((res) => {
                setFolderPath(res.data);
            })
            .catch((err) => {
                console.error(err);
            })
    }, [location]);

    // Connect to socket
    useEffect(() => {
        const newSocket = io('http://localhost:3000');

        newSocket.on('connect', () => setConnectionStatus('open'));
        newSocket.on('disconnect', () => setConnectionStatus('closed'));
        newSocket.on('error', (error) => console.error('Socket.io error:', error));
    
        setSocket(newSocket);
    
        return () => newSocket.disconnect();
    }, []);

    // Display all stored files
    useEffect(() => {
        axios
            .get('http://localhost:3000/dashboard', {
                params: {
                    username: username,
                    folder_id: folderId
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
    }, [filesUpdated, location]);

    return (
        <div className="Dashboard p-[2rem]">
            <div className='flex relative'>
				<div className='w-[14%] h-full fixed z-20'>
                    <h1 className="text-3xl font-bold mb-8 cursor-pointer" onClick={() => navigate('/')}>Spacify</h1>
                    <FilesContext.Provider value = {{filesUpdated, setFilesUpdated}}>
                        {connectionStatus === "open" && (
                            <SocketContext.Provider value = {{socket, connectionStatus}}>
                                    <ProgressContext.Provider value = {{uploadFiles, setUploadFiles}}>
                                        <Upload channel_id={channel_id} folderId={folderId} authentication={{username, accessToken}}/>
                                    </ProgressContext.Provider>
                            </SocketContext.Provider>
                        )}
                    </FilesContext.Provider>
                    <SideBar/>
				</div>
				<div className='ml-[15%] w-[85%]'>
                    <div className='flex justify-between'>
                        <SearchBar name={''} type={'all'} date={'all'} size={'all'}/>
                        <ProfileIcon/>
                    </div>
                    <FilesContext.Provider value = {{filesUpdated, setFilesUpdated}}>
                        {connectionStatus === "open" && (
                            <SocketContext.Provider value = {{socket, connectionStatus}}>
                                <ProgressContext.Provider value = {{downloadFiles, setDownloadFiles}}>
                                    <Display channel_id={channel_id} folderId={folderId} folderPath={folderPath} displayFiles={displayFiles} authentication={{username, accessToken}}/>
                                </ProgressContext.Provider>
                            </SocketContext.Provider>
                        )}
                    </FilesContext.Provider>
				</div>
            </div>
            <ProgressContext.Provider value = {{uploadFiles, setUploadFiles, downloadFiles, setDownloadFiles}}>
                <Progress/>
            </ProgressContext.Provider>
        </div>
    );
};
