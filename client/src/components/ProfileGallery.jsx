import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from './Card';
import { getProfilePrompts } from '../utils/getPrompts';
import { getLikeList } from '../utils/like';
import getUserId from '../utils/getUserId';
import { Sparkles, Heart, Plus, User, ShieldCheck } from 'lucide-react';

const ITEMS_PER_PAGE = 9;

const ProfileGallery = ({ isLoggedIn }) => {
  const navigate = useNavigate();
  const [profilePrompts, setProfilePrompts] = useState([]);
  const [likedPromptIds, setLikedPromptIds] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('created'); // 'created' | 'liked'

  useEffect(() => {
    let isMounted = true;

    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        const [prompts, likes, user] = await Promise.all([
          getProfilePrompts(),
          isLoggedIn ? getLikeList() : Promise.resolve([]),
          isLoggedIn ? getUserId() : Promise.resolve(null),
        ]);

        if (isMounted) {
          setProfilePrompts(Array.isArray(prompts) ? prompts : []);
          setLikedPromptIds(Array.isArray(likes) ? likes : []);
          if (user && user.success !== false) {
            setUserInfo(user);
          }
        }
      } catch (err) {
        console.error('Failed to load profile data:', err);
        if (isMounted) {
          setProfilePrompts([]);
          setLikedPromptIds([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProfileData();

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn]);

  const itemsToDisplay = profilePrompts;
  const totalPages = Math.max(1, Math.ceil((itemsToDisplay.length || 0) / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = itemsToDisplay.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  const totalLikesReceived = profilePrompts.reduce((sum, p) => sum + (p.likes || 0), 0);

  return (
    <div className="bg-[#0A0F1E] min-h-screen py-10 px-4 sm:px-6 lg:px-8 text-white">
      {/* Profile Header Card */}
      <div className="max-w-6xl mx-auto mb-10">
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#4F7FFF]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 relative z-10">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-[#4F7FFF] to-purple-600 flex items-center justify-center text-3xl font-black shadow-lg shadow-[#4F7FFF]/20">
              {userInfo?.username ? userInfo.username.charAt(0).toUpperCase() : <User className="w-10 h-10" />}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {userInfo?.username || 'Creator Profile'}
                </h1>
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#4F7FFF]/20 text-[#4F7FFF] border border-[#4F7FFF]/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Creator</span>
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                {userInfo?.email || 'Logged in to PromptForge'}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 text-sm">
                <div className="flex items-center space-x-2 text-gray-300">
                  <Sparkles className="w-4 h-4 text-[#4F7FFF]" />
                  <span>
                    <strong className="text-white font-semibold">{profilePrompts.length}</strong> Prompts Created
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300">
                  <Heart className="w-4 h-4 text-red-400" />
                  <span>
                    <strong className="text-white font-semibold">{totalLikesReceived}</strong> Total Likes
                  </span>
                </div>
              </div>
            </div>

            <div className="sm:self-center">
              <button
                onClick={() => navigate('/upload')}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#4F7FFF] hover:bg-[#3D6CE5] text-white font-medium shadow-lg shadow-[#4F7FFF]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                <span>New Prompt</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveTab('created')}
              className={`text-lg font-semibold transition pb-1 relative ${
                activeTab === 'created'
                  ? 'text-white border-b-2 border-[#4F7FFF]'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Created Prompts ({profilePrompts.length})
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-gray-400 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-4 border-[#4F7FFF] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Loading your profile creations...</p>
          </div>
        ) : currentItems.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
              {currentItems.map((data, index) => (
                <Card
                  key={data._id || index}
                  id={data._id}
                  isLiked={likedPromptIds.includes(data._id)}
                  imageSrc={data.imageUrl}
                  prompt={data.promptText || data.previewPromptText}
                  likes={data.likes}
                  author={data.author || userInfo?.username || 'You'}
                  category={data.category}
                  aiModel={data.aiModel}
                  pricePaise={data.pricePaise}
                  isLoggedIn={isLoggedIn}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-12 space-x-2">
                <button
                  onClick={() => changePage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-[#111827] border border-white/10 text-white rounded-lg disabled:opacity-30 hover:border-white/20 transition text-sm"
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => changePage(i + 1)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition ${
                      currentPage === i + 1
                        ? 'bg-[#4F7FFF] text-white font-bold'
                        : 'bg-[#111827] border border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => changePage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-[#111827] border border-white/10 text-white rounded-lg disabled:opacity-30 hover:border-white/20 transition text-sm"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-12 text-center max-w-xl mx-auto my-12">
            <Sparkles className="w-12 h-12 text-[#4F7FFF] mx-auto mb-4 opacity-80" />
            <h3 className="text-xl font-bold mb-2">No Prompts Created Yet</h3>
            <p className="text-gray-400 text-sm mb-6">
              You haven't listed any prompts yet. Share your high-quality AI prompts with the marketplace and monetize your prompt engineering skills!
            </p>
            <button
              onClick={() => navigate('/upload')}
              className="px-6 py-2.5 rounded-xl bg-[#4F7FFF] hover:bg-[#3D6CE5] text-white font-medium transition shadow-lg shadow-[#4F7FFF]/20"
            >
              Upload Your First Prompt
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileGallery;