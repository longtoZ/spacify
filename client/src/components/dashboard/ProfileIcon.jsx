import UserProfileImg from '../../assets/user/user.jpg';

export const ProfileIcon = () => {
  return (
    <div className='ProfileIcon'>
        <div className='rounded-[50%] w-[2.5rem] h-[2.5rem] border-primary-3 border-2 cursor-pointer overflow-hidden'>
            <img src={UserProfileImg} alt='User profile' className='w-full object-fill'/>
        </div>
    </div>
  )
}
