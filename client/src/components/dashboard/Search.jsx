import SearchIcon from '@mui/icons-material/Search';

export const Search = () => {
  return (
    <div className='flex w-[20rem] bg-primary-1 rounded-md px-2'>
        <SearchIcon className='text-neutral-500 w-[10%] block my-auto'/>
        <input
            type='text'
            placeholder='Search for files'
            className='p-2 border-none bg-transparent w-[90%] focus-visible:outline-none'
        />
    </div>
  )
}
