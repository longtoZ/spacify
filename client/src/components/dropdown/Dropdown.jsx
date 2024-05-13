import { useState, useContext } from 'react';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import { filterContext } from '../../pages/search/Search';

export const Dropdown = ({type, options}) => {

    const {query, setQuery} = useContext(filterContext);
    const [selectedOption, setSelectedOption] = useState(options[0]);
    const [isOpen, setIsOpen] = useState(false);

    const handleOptionClick = (option) => {
        setSelectedOption(option);
        setIsOpen(false);

        if (type === 'type') {
            setQuery((prev) => ({
                ...prev,
                type: option.toLowerCase(),
            }));
        } else if (type === 'date') {
            setQuery((prev) => ({
                ...prev,
                date: option.toLowerCase(),
            }));
        } else if (type === 'size') {
            setQuery((prev) => ({
                ...prev,
                size: option.toLowerCase(),
            }));
        }
    };

    return (
        <div className="Dropdown w-[60%] relative cursor-pointer">
            <div className="relative dropdown-title rounded-md bg-primary-1 py-2 px-4 flex justify-between flex-row" onClick={() => setIsOpen(!isOpen)}>
                {selectedOption}
                <ArrowDropDownIcon className="ml-4 text-neutral-500" />
            </div>
            {isOpen && (
                <div className="absolute z-20 w-full mt-2 dropdown-menu rounded-md bg-primary-1 py-2">
                    {options.map((option, index) => (
                        <div
                            key={index}
                            className="dropdown-option py-2 rounded-md hover:bg-bg-hover px-4"
                            onClick={() => handleOptionClick(option)}
                        >
                            {option}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dropdown;
