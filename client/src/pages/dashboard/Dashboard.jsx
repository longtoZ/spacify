import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import { SideBar } from '../../components/dashboard/SideBar';
import { Upload } from '../../components/dashboard/Upload';
import { Search } from '../../components/dashboard/Search';
import { Display } from '../../components/dashboard/Display';

export const Home = () => {
    const navigate = useNavigate();
    const [displayFiles, setDisplayFiles] = useState([]);

    const [username, setUsername] = useState(localStorage.getItem('username'));
    const [channel_id, setChannelId] = useState(
        localStorage.getItem('channel_id'),
    );
    const [accessToken, setAccessToken] = useState(
        localStorage.getItem('accessToken'),
    );

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
    }, []);

    return (
        <div className="Dashboard p-[2rem]">
            <div className='flex'>
				<div className='w-[15%]'>
					<Upload channel_id={channel_id} authentication={{username, accessToken}} />
					<SideBar/>
				</div>
				<div className='w-[85%]'>
                    <Search/>
					<Display displayFiles={displayFiles} authentication={{username, accessToken}} />
				</div>
            </div>
        </div>
    );
};
