import { Heart, Copy, Share2, CornerUpLeft } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Prompt = (props) => {
  const navigate = useNavigate();
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(props.promptText);
      toast.success("Copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "StealMyPrompts",
          text: "Check out this cool Prompt!",
          url: window.location.href,
        });
        console.log("Shared successfully!");
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      alert("Sharing not supported on this browser.");
    }
  };
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row bg-[#1a1a2e] rounded-xl shadow-2xl overflow-hidden">
        <div className="relative lg:w-3/5 bg-gray-800 flex flex-col p-4">
          <button
            className="absolute top-4 left-4 text-white text-sm font-semibold flex items-center space-x-1 hover:text-gray-300 transition"
            onClick={() => navigate(-1)}
          >
            <CornerUpLeft size={16} />
            <span>Back to gallery</span>
          </button>
          <div className="grow flex items-center justify-center pt-10 pb-4">
            <div className={`w-full max-w-lg aspect-4/5 rounded-xl overflow-hidden shadow-2xl border border-gray-700 ${!props.imageSrc ? 'bg-gray-700 flex items-center justify-center text-white' : ''}`}>
              {props.imageSrc ? (
                <img
                  src={props.imageSrc}
                  alt={props.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm">Image Placeholder</span>
              )}
            </div>
          </div>
        </div>

        <div className="lg:w-2/5 p-6 sm:p-8 bg-[#0d0d1b] flex flex-col">
          <div className="mb-6">
            <p className="text-xs uppercase font-bold text-white mb-2 tracking-widest">
              PROMPT DETAIL
            </p>
            <h1 className="text-4xl font-bold text-white mb-2">
              {props.title}
            </h1>
            <h1 className="text-l font-bold text-white mb-2">
              Category: {props.category}
            </h1>
            <p className="text-sm text-gray-400">
              Shared by <span className="text-blue-500 hover:underline cursor-pointer">{props.author}</span>
            </p>
            <p className="text-sm text-gray-500">
              Posted on {props.updatedOn.slice(0,10)}
            </p>
          </div>

          <div className="mb-2">
            <h2 className="text-sm uppercase font-bold text-white mb-3 tracking-wider">
              PROMPT
            </h2>
            <div className="relative h-64 overflow-y-auto custom-scrollbar pr-2">
              <p className="text-base text-gray-300 whitespace-pre-line">
                {props.promptText}
              </p>
            </div>
            
            <div className="flex items-center space-x-3 mt-5">
              <button onClick={handleCopy} className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600 transition">
                <Copy size={16} />
                <span>Copy</span>
                <Toaster position="top-center" />
              </button>
              <a href='https://gemini.google.com/' target='blank'>
              <button className="px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-400 transition shadow-lg shadow-blue-500/50">
                Try this
              </button>
              </a>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <div className="flex items-center space-x-1 text-gray-400">
              <Heart size={20} className="text-red-500 fill-red-500" />
              <span className="text-lg font-semibold text-white">{props.likes}</span>
              <span className="text-sm"> TOTAL LIKES</span>
            </div>
            <button onClick={handleShare} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition">
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prompt;