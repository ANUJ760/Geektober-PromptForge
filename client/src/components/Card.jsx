import { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import toast, { Toaster } from "react-hot-toast";
import { Copy } from 'lucide-react';

const Card = (props) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const path = `/prompt/${props.id}`
  function handleLikeClick() {
    props.isLoggedIn ? setIsLiked(!isLiked) : navigate('/login');
  };
  function handleClick() {
    navigate(path);
  };
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(props.prompt);
      toast.success("Copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };
  return (
    <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-700 w-80 flex flex-col"> 
      
      <div className="relative pb-[100%]"> 
        <img 
          src={props.imageSrc} 
          alt={props.category} 
          className="absolute inset-0 w-full h-full object-cover" 
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black to-transparent opacity-70"></div>

        <div className="absolute top-4 left-4 right-4 flex justify-between items-center text-white z-10"> 
          <span className="bg-gray-900 bg-opacity-70 text-xs font-semibold px-3 py-1 rounded-full uppercase">
            {props.category}
          </span>
          {isLiked ? 
            <button onClick={handleLikeClick} className="flex items-center bg-gray-900 bg-opacity-70 px-2.5 py-1 rounded-full">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 mr-1 fill-red-500 stroke-red-500"
              viewBox="0 0 24 24" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <span className="text-sm font-medium">{props.likes}</span>
          </button>:
            <button onClick={handleLikeClick} className="flex items-center bg-gray-900 bg-opacity-70 px-2.5 py-1 rounded-full">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 mr-1 fill-gray-500 stroke-gray-500"
              viewBox="0 0 24 24" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <span className="text-sm font-medium">{props.likes}</span>
          </button>}
        </div>

        <div className="absolute bottom-4 left-4 right-4 text-white z-10">
            <p className="text-base font-medium leading-tight line-clamp-4">
                {props.prompt}
            </p>
            <button className="bg-gray-800 bg-opacity-70 text-xs font-semibold mt-1 px-3 py-1 rounded-full uppercase">
              @{props.author}
            </button>
        </div>
      </div>

      <div className="p-4 flex items-center justify-between bg-gray-800 border-t border-gray-700"> 
        <button onClick={handleCopy} className="flex items-center text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition duration-200">
          <Copy className="h-4 w-4 mr-2" /> 
          Copy
        </button>
        <Toaster position="top-center" />
        <button onClick={handleClick} className="flex items-center text-white bg-gray-900 bg-opacity-70 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition duration-200">
          View
        </button>
      </div>
    </div>
  );
};

export default Card;