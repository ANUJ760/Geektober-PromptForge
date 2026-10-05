import Card from './Card';
import SkeletonCard from './SkeletonCard';
import { getPrompts } from '../utils/getPrompts';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLikeList } from '../utils/like';

const ITEMS_TO_SHOW = 6;
const IMAGE_LOAD_TIMEOUT = 3000;

const GallerySection = ({ isLoggedIn }) => {
  const navigate = useNavigate();

  const [imageData, setImageData] = useState([]);
  const [likedPrompts, setLikedPrompts] = useState([]);

  const [apiLoading, setApiLoading] = useState(true);
  const [imagesLoading, setImagesLoading] = useState(true);

  const imagesLoadedRef = useRef(0);
  const expectedImagesRef = useRef(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setApiLoading(true);
        setImagesLoading(true);

        const data = await getPrompts();
        const limited = (data || []).slice(0, ITEMS_TO_SHOW);

        if (isLoggedIn) {
          setLikedPrompts(await getLikeList() || []);
        }

        setImageData(limited);
        expectedImagesRef.current = limited.length;
        imagesLoadedRef.current = 0;

        timeoutRef.current = setTimeout(() => {
          setImagesLoading(false);
        }, IMAGE_LOAD_TIMEOUT);
      } catch (e) {
        console.error(e);
        setImageData([]);
        setImagesLoading(false);
      } finally {
        setApiLoading(false);
      }
    };

    fetchData();

    return () => clearTimeout(timeoutRef.current);
  }, [isLoggedIn]);

  const handleImageLoad = () => {
    imagesLoadedRef.current += 1;

    if (imagesLoadedRef.current >= expectedImagesRef.current) {
      clearTimeout(timeoutRef.current);
      setImagesLoading(false);
    }
  };

  const isLoading = apiLoading || imagesLoading;

  return (
    <div className="bg-[#0c1121] min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 text-white">
          See what the community is creating and loving right now.
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Every image comes with the exact prompt that created it.
        </p>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
        {isLoading ? (
          Array.from({ length: ITEMS_TO_SHOW }).map((_, i) => (
            <SkeletonCard key={i} />
          ))
        ) : imageData.length > 0 ? (
          imageData.map((data) => (
            <Card
              key={data._id}
              id={data._id}
              imageSrc={data.imageUrl}
              prompt={data.promptText}
              likes={data.likes}
              author={data.author || 'Anonymous'}
              category={data.category}
              aiModel={data.aiModel}
              pricePaise={data.pricePaise}
              isLiked={likedPrompts.includes(data._id)}
              isLoggedIn={isLoggedIn}
              onImageLoad={handleImageLoad}
            />
          ))
        ) : (
          <div className="col-span-3 text-center text-gray-400">
            No trending prompts found right now.
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="flex justify-center mt-12">
        <button
          onClick={() => navigate('/explore')}
          className="bg-gray-800 text-white px-6 py-3 rounded-xl border border-white hover:bg-gray-700"
        >
          Explore Trending Prompts
        </button>
      </div>
    </div>
  );
};

export default GallerySection;
