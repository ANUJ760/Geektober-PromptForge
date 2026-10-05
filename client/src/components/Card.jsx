import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { Sparkles, Eye } from 'lucide-react';
import { updateLike } from '../utils/like';

const Card = ({
  id,
  imageSrc,
  prompt,
  likes,
  author,
  category,
  aiModel,
  pricePaise = 0,
  isLiked: initialLiked,
  isLoggedIn,
  onImageLoad,
}) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(likes);

  useEffect(() => {
    setIsLiked(initialLiked);
    setLikeCount(likes);
  }, [initialLiked, likes]);

  async function handleLikeClick(e) {
    e.stopPropagation();
    if (!isLoggedIn) {
      toast.error('Log in to like prompts!');
      setTimeout(() => navigate('/login'), 800);
      return;
    }

    try {
      const data = await updateLike(isLiked, id);
      setIsLiked(!isLiked);
      setLikeCount(data.prompt?.likes ?? likeCount + (isLiked ? -1 : 1));
    } catch (err) {
      console.error('Like toggle error:', err);
    }
  }

  const isFree = !pricePaise || pricePaise === 0;
  const formattedPrice = isFree ? 'FREE' : `₹${(pricePaise / 100).toFixed(0)}`;

  return (
    <div
      onClick={() => navigate(`/prompt/${id}`)}
      className="bg-[#111827] rounded-2xl overflow-hidden shadow-xl border border-white/10 hover:border-white/20 transition group flex flex-col w-80 cursor-pointer"
    >
      {/* Image Preview Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-950">
        <img
          src={imageSrc}
          alt={category}
          loading="lazy"
          onLoad={onImageLoad}
          onError={onImageLoad}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />

        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#111827] via-black/60 to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10">
          <div className="flex items-center space-x-1.5">
            <span className="bg-black/70 backdrop-blur-md text-xs px-2.5 py-1 rounded-full uppercase tracking-wider text-gray-200 border border-white/10">
              {category}
            </span>
            {aiModel && (
              <span className="bg-blue-950/80 backdrop-blur-md text-[11px] px-2 py-0.5 rounded-full text-blue-300 border border-blue-500/30">
                {aiModel}
              </span>
            )}
          </div>

          <button
            onClick={handleLikeClick}
            className="flex items-center bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 hover:scale-105 transition cursor-pointer"
          >
            <span className={`mr-1 text-sm ${isLiked ? 'text-red-500' : 'text-gray-400'}`}>
              ♥
            </span>
            <span className="text-xs text-white font-medium">{likeCount}</span>
          </button>
        </div>

        {/* Bottom Card Preview */}
        <div className="absolute bottom-3 left-3 right-3 text-white z-10 pointer-events-none">
          <p className="text-xs text-gray-300 line-clamp-3 mb-1 font-mono">
            {prompt}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">@{author}</span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                isFree
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {formattedPrice}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div className="p-3 bg-[#0d121f] flex items-center justify-between border-t border-white/5">
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <Sparkles size={13} className="text-blue-400" />
          {isFree ? 'Instant Access' : 'Verified Prompt'}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/prompt/${id}`);
          }}
          className="flex items-center space-x-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
        >
          <Eye size={13} />
          <span>{isFree ? 'View' : 'Unlock'}</span>
        </button>
      </div>

      <Toaster position="top-center" />
    </div>
  );
};

export default Card;
