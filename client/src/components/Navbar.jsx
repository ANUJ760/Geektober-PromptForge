import { Link } from "react-router-dom";
import { MoreVertical } from "lucide-react";

const Navbar = ({isLoggedIn}) => {
  return (
    <nav className="flex items-center justify-between bg-[#0A0F1E] text-white px-6 py-3 rounded-full border border-[#ffffff] mt-6 ml-6 mr-6 shadow-md">
      <div className="flex items-center space-x-2">
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
        <span className="font-semibold tracking-widest text-sm">
          BANANA PROMPTS
        </span>
      </div>

      <div className="flex items-center space-x-6 text-gray-400 text-sm">
        <a href="/" className="hover:text-white transition">Home</a>
        <a href="/explore" className="hover:text-white transition">Explore</a>
        <a href="#" className="hover:text-white transition">Studio</a>
      </div>

      <div className="flex items-center space-x-3">
        {isLoggedIn ? <button className="bg-[#16203a] border border-[#737373] text-white font-semibold text-sm px-4 py-1.5 rounded-full hover:bg-[#1A2033] transition">
          <Link to='/logout'>Logout</Link> 
        </button> : <button className="bg-[#0F1526] border border-[#737373] text-white font-semibold text-sm px-4 py-1.5 rounded-full hover:bg-[#1A2033] transition">
          <Link to='/login'>Login</Link> 
        </button>}
        <div className="w-8 h-8 flex items-center justify-center rounded-full border border-[#1C2233] cursor-pointer hover:bg-[#1A2033] transition">
          <MoreVertical size={18} />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
