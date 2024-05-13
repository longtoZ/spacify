import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';

export const SearchBar = ({type, date, size}) => {

	const navigate = useNavigate();

	const handleQueryString = (name, type, date, size) => {
		let queryString = '';

		if (name !== '') {
			queryString += `name=${name}&`;
		}

		if (type !== 'all') {
			queryString += `type=${type}&`;
		}

		if (date !== 'all') {
			queryString += `date=${date}&`;
		}

		if (size !== 'all') {
			queryString += `size=${size}&`;
		}

		return queryString;
	}

    return (
        <div className="flex w-[25rem] bg-primary-1 rounded-md px-2">
            <SearchIcon className="text-neutral-500 w-[10%] block my-auto" />
            <input
                type="text"
                placeholder="Search for files"
                className="p-2 border-none bg-transparent w-[90%] focus-visible:outline-none"
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
						console.log('searching')
						
						navigate(`/search?${handleQueryString(e.target.value.trim(), type, date, size)}`);
						navigate(0)
                    }
                }}
            />
        </div>
    );
};
