import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import AutoDeleteRoundedIcon from '@mui/icons-material/AutoDeleteRounded';

export const SideBar = () => {
    return (
        <div className='mr-4 mt-8'>
            <ul>
                <li className="my-4 p-2 rounded-lg flex cursor-pointer hover:bg-[#14202edb]">
                    <HomeRoundedIcon />
                    <a className='ml-4' href="#">Home</a>
                </li>
                <li className="my-4 p-2 rounded-lg flex cursor-pointer hover:bg-[#14202edb]">
                    <GroupRoundedIcon />
                    <a className='ml-4' href="#">Shared with me</a>
                </li>
				<li className="my-4 p-2 rounded-lg flex cursor-pointer hover:bg-[#14202edb]">
					<AutoDeleteRoundedIcon />
					<a className='ml-4' href="#">Recycle bin</a>
				</li>
            </ul>
        </div>
    );
};
