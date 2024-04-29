import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import AutoDeleteRoundedIcon from '@mui/icons-material/AutoDeleteRounded';

export const SideBar = () => {
    return (
        <div className='mr-4 mt-8'>
            <ul>
                <li className="my-4 p-2 rounded-lg flex cursor-pointer hover:bg-[#14202edb]">
                    <DashboardRoundedIcon />
                    <a className='ml-4' href="#">Dashboard</a>
                </li>
                <li className="my-4 p-2 rounded-lg flex cursor-pointer hover:bg-[#14202edb]">
                    <AutoAwesomeRoundedIcon/>
                    <a className='ml-4' href="#">Favourite</a>
                </li>
				<li className="my-4 p-2 rounded-lg flex cursor-pointer hover:bg-[#14202edb]">
					<AutoDeleteRoundedIcon />
					<a className='ml-4' href="#">Recycle bin</a>
				</li>
            </ul>
        </div>
    );
};
