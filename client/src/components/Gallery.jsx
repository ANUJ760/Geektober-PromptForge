import Card from './Card';
import { getPrompts } from '../utils/getPrompts';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLikeList } from '../utils/like';

const GallerySection = ({isLoggedIn}) => {
  const navigate = useNavigate();
  const [imageData, setImageData] = useState(null);
  const [likedPrompts, setLikedPrompts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getPrompts();
        if (isLoggedIn) {
          const likeList = await getLikeList();
          setLikedPrompts(likeList || []);
        }
        setImageData(data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setImageData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isLoggedIn]);

  function handleClick() {
    navigate('/explore');
  }

  const isDataValid = Array.isArray(imageData) && imageData.length > 0;
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
          See what the community is creating and loving right now.
        </h1>
        <p className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
          Every image comes with the exact prompt that created it. Skip the guesswork 
          and learn directly from pieces that caught the community's attention.
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8 justify-items-center">
        {isDataValid ? (
          imageData.map((data, index) => (
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
            No trending prompts found right now. Check back later!
          </div>
        )}
      </div>
      <div className='flex justify-center'>
        <button onClick={handleClick} className="bg-gray-800 text-l rounded-4xl pl-4 pr-4 pt-2 pb-2 mt-12 text-white border-2 border-white hover:bg-gray-700">Explore Trending Prompts</button>
      </div>
    </div>
  );
};

export default GallerySection;