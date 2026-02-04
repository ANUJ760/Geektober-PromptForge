import Card from './Card';
import SkeletonCard from './SkeletonCard';
import { getAllPrompts } from '../utils/getPrompts';
import { getLikeList } from '../utils/like';
import { useEffect, useState, useRef } from 'react';

const ITEMS_PER_PAGE = 9;
const IMAGE_LOAD_TIMEOUT = 3000;

const ExploreGallery = ({ isLoggedIn }) => {
  const [data, setData] = useState([]);
  const [likedPrompts, setLikedPrompts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

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

        const prompts = await getAllPrompts();

        if (isLoggedIn) {
          setLikedPrompts(await getLikeList() || []);
        }

        setData(prompts || []);
      } catch (err) {
        console.error(err);
        setData([]);
        setImagesLoading(false);
      } finally {
        setApiLoading(false);
      }
    };

    fetchData();
  }, [isLoggedIn]);

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = data.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    imagesLoadedRef.current = 0;
    expectedImagesRef.current = currentItems.length;
    setImagesLoading(currentItems.length > 0);

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setImagesLoading(false);
    }, IMAGE_LOAD_TIMEOUT);

    return () => clearTimeout(timeoutRef.current);
  }, [currentPage, data]);

  const handleImageLoad = () => {
    imagesLoadedRef.current += 1;

    if (imagesLoadedRef.current >= expectedImagesRef.current) {
      clearTimeout(timeoutRef.current);
      setImagesLoading(false);
    }
  };

  const isLoading = apiLoading || imagesLoading;

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[#0c1121] min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
          Explore Community Prompts
        </h1>
        <p className="text-lg text-gray-300">
          Discover prompts the community is creating and loving.
        </p>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
        {isLoading ? (
          Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
            <SkeletonCard key={i} />
          ))
        ) : currentItems.length > 0 ? (
          currentItems.map((item) => (
            <Card
              key={item._id}
              id={item._id}
              imageSrc={item.imageUrl}
              prompt={item.promptText}
              likes={item.likes}
              author={item.author || 'Anonymous'}
              category={item.category}
              isLiked={likedPrompts.includes(item._id)}
              isLoggedIn={isLoggedIn}
              onImageLoad={handleImageLoad}
            />
          ))
        ) : (
          <div className="col-span-3 text-gray-400 text-center">
            No prompts found.
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex justify-center mt-12 space-x-2">
          <button
            onClick={() => changePage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 bg-gray-700 text-white rounded disabled:opacity-40"
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => changePage(i + 1)}
              className={`px-3 py-2 rounded ${
                currentPage === i + 1
                  ? 'bg-white text-black font-bold'
                  : 'bg-gray-800 text-white hover:bg-gray-600'
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => changePage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 bg-gray-700 text-white rounded disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ExploreGallery;
