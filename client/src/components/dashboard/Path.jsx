import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import { useNavigate } from 'react-router-dom';

export const Path = ({ folderPath }) => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-row items-center mb-[1rem]">
            {folderPath &&
                folderPath.map((folder, index) => {
                    return (
                        <>
                            <div
                                className="text-xl font-bold p-2 mx-1 rounded-lg cursor-pointer hover:bg-primary-1-light"
                                onClick={() => {
                                    const fullId = folder.folder_id;
                                    const id = fullId.substr(
                                        fullId.indexOf('_', 0) + 1,
                                    );

                                    navigate(`/dashboard/${id}`);
                                }}
                                style={{ transition: 'all ease 0.1s' }}>
                                {folder.folder_name}
                            </div>
                            <div>
                                {index !== folderPath.length - 1 && (
                                    <KeyboardArrowRightRoundedIcon />
                                )}
                            </div>
                        </>
                    );
                })}
        </div>
    );
};
