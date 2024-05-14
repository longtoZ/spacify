import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import ArrowCircleRightRoundedIcon from '@mui/icons-material/ArrowCircleRightRounded';

export const SearchBar = ({name, type, date, size}) => {

	const navigate = useNavigate();
	const [searchQuery, setSearchQuery] = useState(name);

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

	const handleSearch = (name, type, date, size) => {
		navigate(`/search?${handleQueryString(name, type, date, size)}`);
		navigate(0);
	}

    return (
        <div className="flex w-[25rem] bg-primary-1 rounded-md px-2">
            <SearchIcon className="text-neutral-500 w-[10%] block my-auto" />
            <input
                type="text"
                placeholder="Search for files"
				defaultValue={name}
                className="p-2 border-none bg-transparent w-[90%] focus-visible:outline-none"
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {						
						handleSearch(e.target.value.trim(), type, date, size);
                    }
                }}
				onChange={(e) => setSearchQuery(e.target.value.trim())}
            />
			<ArrowCircleRightRoundedIcon className='block my-auto text-primary-3 brightness-150 cursor-pointer' onClick={() => {
				console.log('clicked')
				handleSearch(searchQuery, type, date, size)
			}}/>
        </div>
    );
};
