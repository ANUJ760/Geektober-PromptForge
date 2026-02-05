import Card from './Card';
import { getProfilePrompts } from '../utils/getPrompts';
import { useState, useEffect } from 'react';
import { getLikeList } from '../utils/like';

const ITEMS_PER_PAGE = 9;

const GallerySection = ({ isLoggedIn }) => {
  const [imageData, setImageData] = useState([]);
  const [likedPrompts, setLikedPrompts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getProfilePrompts();
        if (isLoggedIn) {
          const likeList = await getLikeList();
          setLikedPrompts(likeList || []);
        }
        setImageData(data || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setImageData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isLoggedIn]);
  
  const totalPages = Math.ceil(imageData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = imageData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#0c1121] min-h-screen py-16 px-4 text-center text-white">
        Loading community prompts...
      </div>
    );
  }

  return (
    <div className="bg-[#0c1121] min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight text-white">
          Your Profile Gallery
        </h1>
      </div>
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
        {currentItems.length > 0 ? (
          currentItems.map((data, index) => (
            <Card 
              key={index}
              id={data._id}
              isLiked={likedPrompts.includes(data._id)}
              imageSrc={data.imageUrl}
              prompt={data.promptText}
              likes={data.likes}
              author={data.author || "Anonymous"}
              category={data.category}
              isLoggedIn={isLoggedIn}
            />
          ))
        ) : (
          <div className="col-span-3 text-center text-gray-400">
            You have not created any prompts yet.
          </div>
        )}
      </div>

      <div className="flex justify-center mt-12 space-x-2">
        <button
          onClick={() => changePage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-40"
        >
          Prev
        </button>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => changePage(i + 1)}
            className={`px-3 py-2 rounded-lg ${
              currentPage === i + 1
                ? "bg-white text-black font-bold"
                : "bg-gray-800 text-white hover:bg-gray-600"
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => changePage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default GallerySection;