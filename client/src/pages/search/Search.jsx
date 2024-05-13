import { useState, useEffect, useRef, createContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

import { displayDate, displayFileSize } from '../../utils/common';

import { SearchBar } from '../../components/dashboard/SearchBar';
import { Dropdown } from '../../components/dropdown/Dropdown';

import FolderRoundedIcon from '@mui/icons-material/FolderRounded';

export const filterContext = createContext();

export const Search = () => {

    const navigate = useNavigate();

    const [searchParams, setSearchParams] = useSearchParams();
    const [searchResult, setSearchResult] = useState({});

    const [username] = useState(localStorage.getItem('username'));
    const [accessToken] = useState(
        localStorage.getItem('accessToken'),
    );

    const [query, setQuery] = useState({
        name: searchParams.get('name') || '',
        type: searchParams.get('type') || 'all',
        date: searchParams.get('date') || 'all',
        size: searchParams.get('size') || 'all',
    });

    const typeRef = useRef(null);
    const dateRef = useRef(null);
    const sizeRef = useRef(null);

    // Get search result
    useEffect(() => {
        axios
            .get('http://localhost:3000/api/search', {
                params: {
                    username: username,
                    name: query.name,
                    type: query.type,
                    date: query.date,
                    size: query.size,
                },
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            })
            .then((res) => {
                if (res.status === 200) {
                    setSearchResult(res.data);
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
        <div className='Search p-[2rem]'>
            <div className='flex relative'>
				<div className='w-[12.8%] h-full fixed z-20'>
                    <h1 className="text-3xl font-bold mb-8 cursor-pointer" onClick={() => navigate('/')}>Spacify</h1>
                    <h1 className='font-bold mt-[3rem] mb-[2rem]'>Filter</h1>
                    <div className=''>
                        <filterContext.Provider value={{query, setQuery}}>
                            <div className='flex flex-row justify-between mb-[1rem]'>
                                <span className='w-[30%]'>Type</span>
                                <Dropdown type={'type'} options={["File", "Folder", "All"]}/>
                            </div>
                            <div className='flex flex-row justify-between mb-[1rem]'>
                                <span className='w-[30%]'>Date</span>
                                <Dropdown type={'date'} options={["Today", "This week", "This month", "All"]}/>
                            </div>
                            <div className='flex flex-row justify-between mb-[1rem]'>
                                <span className='w-[30%]'>Size</span>
                                <Dropdown type={'size'} options={["Small", "Medium", "Large", "All"]}/>
                            </div>
                        </filterContext.Provider>

                    </div>
                </div>
                <div className='ml-[15%] w-[85%]'>
                    <SearchBar type={query.type} date={query.date} size={query.size}/>
                    <h1 className='text-xl font-bold mx-1 mt-[2rem] mb-[1rem]'>Search result</h1>
                    <ul className='bg-primary-1 rounded-lg p-4'>
                        <li className='flex gap-4 justify-between mb-4'>
                            <span className='w-[64%] font-bold'>Name</span>
                            <span className='w-[12%] text-left font-bold'>Last updated</span>
                            <span className='w-[12%] text-left font-bold'>Size</span>
                            <span className='w-[12%] text-left font-bold'>Location</span>
                        </li>
                        <li className='w-full mb-12 border-[#ffffffb3] border-[1px]'></li>

                        {searchResult.folders && searchResult.folders.map((folder, index) => {
                            return (
                                <li className='relative folder-item hover:bg-bg-hover rounded-lg cursor-pointer' style={{transition:'all ease 0.2s'}} onClick={(e) => {
                                    e.preventDefault();

                                    if (!e.ctrlKey) {
                                        const fullId = folder.parent_id;
                                        const id = fullId == 'null' ? '' : fullId.substr(fullId.indexOf('_', 0) + 1)

                                        navigate(`/dashboard/${id}`)
                                    }

                                }}>
                                    <div
                                        key={index}
                                        className="flex gap-4 justify-between py-6 px-2">
                                        <div className='w-[64%]'>
                                            <span className='cursor-pointer'>
                                                <FolderRoundedIcon className='mr-2'/>
                                                <span>{folder.folder_name}</span>
                                            </span>
                                        </div>
                                        <span className="w-[12%] text-left">
                                            {displayDate(folder.folder_date)}
                                        </span>
                                        <span className="w-[12%] text-left">
                                            -
                                        </span>
                                        <span className="w-[12%] text-left">
                                            {folder.folder_name}
                                        </span>
                                    </div>
                                    <div className='w-full border-transparent border-b-[#ffffff66] border-[1px]'></div>
                                </li>
                            )
                        })}

                        {searchResult.files && searchResult.files.map((file, index) => {
                            return (
                                <li className='relative file-item hover:bg-bg-hover rounded-lg cursor-pointer' style={{transition:'all ease 0.2s'}} onClick={(e) => {
                                    e.preventDefault();

                                    if (!e.ctrlKey) {
                                        const fullId = file.folder_id;
                                        const id = fullId == 'null' ? '' : fullId.substr(fullId.indexOf('_', 0) + 1)

                                        navigate(`/dashboard/${id}`)
                                    }
                                }}>
                                    <div
                                        key={index}
                                        className="flex gap-4 justify-between py-6 px-2">
                                        <span className="w-[64%]">{file.file_name}</span>
                                        <span className="w-[12%] text-left">
                                            {displayDate(file.file_date)}
                                        </span>
                                        <span className="w-[12%] text-left">
                                            {displayFileSize(file.file_size)}
                                        </span>
                                        <span className="w-[12%] text-left">
                                            {file.folder_name}
                                        </span>
                                    </div>
                                    <div className='w-full border-transparent border-b-[#ffffff66] border-[1px]'></div>
                                </li>

                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    )
};
