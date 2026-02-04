import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { Copy } from 'lucide-react';
import { updateLike } from '../utils/like';

const Card = ({
  id,
  imageSrc,
  prompt,
  likes,
  author,
  category,
  isLiked: initialLiked,
  isLoggedIn,
  onImageLoad
}) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(likes);

  useEffect(() => {
    setIsLiked(initialLiked);
    setLikeCount(likes);
  }, [initialLiked, likes]);

  async function handleLikeClick() {
    if (!isLoggedIn) {
      toast.error('You must be logged in to like a prompt!');
      setTimeout(() => navigate('/login'), 1000);
      return;
    }

    try {
      const data = await updateLike(isLiked, id);
      setIsLiked(!isLiked);
      setLikeCount(data.prompt.likes);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-700 w-80 flex flex-col">
      {/* IMAGE (ONLY ONE) */}
      <div className="relative aspect-square">
        <img
          src={imageSrc}
          alt={category}
          loading="lazy"
          onLoad={onImageLoad}
          onError={onImageLoad}
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/80 to-transparent" />

        <div className="absolute top-4 left-4 right-4 flex justify-between text-white z-10">
          <span className="bg-black/60 text-xs px-3 py-1 rounded-full uppercase">
            {category}
          </span>

          <button
            onClick={handleLikeClick}
            className="flex items-center bg-black/60 px-2.5 py-1 rounded-full"
          >
            <span className={`mr-1 ${isLiked ? 'text-red-500' : 'text-gray-400'}`}>
              ♥
            </span>
            <span className="text-sm">{likeCount}</span>
          </button>
        </div>

        <div className="absolute bottom-4 left-4 right-4 text-white z-10">
          <p className="text-sm line-clamp-4">{prompt}</p>
          <span className="text-xs opacity-80">@{author}</span>
        </div>
      </div>

      <div className="p-4 flex justify-between border-t border-gray-700">
        <button
          onClick={() => navigator.clipboard.writeText(prompt)}
          className="bg-blue-600 px-4 py-2 rounded-lg text-sm text-white"
        >
          <Copy className="inline h-4 w-4 mr-1" />
          Copy
        </button>

        <button
          onClick={() => navigate(`/prompt/${id}`)}
          className="bg-gray-700 px-4 py-2 rounded-lg text-sm text-white"
        >
          View
        </button>
      </div>

      <Toaster position="top-center" />
    </div>
  );
};

export default Card;
