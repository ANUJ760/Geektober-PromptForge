import { useEffect, useState, useRef } from 'react';
import Card from './Card';
import SkeletonCard from './SkeletonCard';
import { getAllPrompts } from '../utils/getPrompts';
import { getLikeList } from '../utils/like';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Photography',
  'Concept Art',
  'Graphic Design',
  'Illustration',
  'Digital Art',
  '3D Render',
  'Anime',
];

const AI_MODELS = [
  'All',
  'Midjourney v6',
  'DALL-E 3',
  'Stable Diffusion XL',
  'Flux.1',
  'Other',
];

const ExploreGallery = ({ isLoggedIn }) => {
  const [prompts, setPrompts] = useState([]);
  const [likedPrompts, setLikedPrompts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeModel, setActiveModel] = useState('All');
  const [activePricing, setActivePricing] = useState('all'); // all, free, paid
  const [activeSort, setActiveSort] = useState('trending'); // trending, popular, newest, price_asc, price_desc

  const [isLoading, setIsLoading] = useState(true);
  const debounceTimerRef = useRef(null);

  const fetchCatalog = async (page = currentPage, query = searchTerm) => {
    try {
      setIsLoading(true);
      const res = await getAllPrompts({
        q: query,
        category: activeCategory,
        aiModel: activeModel,
        pricing: activePricing,
        sort: activeSort,
        page,
        limit: 9,
      });

      setPrompts(res.prompts || []);
      if (res.pagination) {
        setTotalPages(res.pagination.totalPages || 1);
        setTotalCount(res.pagination.totalCount || 0);
      }

      if (isLoggedIn) {
        try {
          const likes = await getLikeList();
          setLikedPrompts(likes || []);
        } catch {
          // Non-blocking
        }
      }
    } catch (err) {
      console.error('Failed to fetch catalog prompts:', err);
      setPrompts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch on filter changes
  useEffect(() => {
    setCurrentPage(1);
    fetchCatalog(1, searchTerm);
  }, [activeCategory, activeModel, activePricing, activeSort, isLoggedIn]);

  // Handle Search Input with 350ms debounce
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setCurrentPage(1);
      fetchCatalog(1, val);
    }, 350);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      fetchCatalog(page, searchTerm);
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[#0c1121] min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="max-w-4xl mx-auto text-center mb-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <Sparkles size={14} />
          <span>Curated Generative Marketplace</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
          Explore AI Prompts
        </h1>
        <p className="text-base sm:text-lg text-gray-300">
          Discover, search, and license verified prompts across Midjourney, DALL-E, SDXL, and Flux.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="max-w-7xl mx-auto mb-10 space-y-5">
        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto">
          <Search size={20} className="absolute left-4 top-3.5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search keywords, styles, lighting, subjects (e.g. cyberpunk, watercolor, portrait)..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-[#141b2d] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition shadow-lg"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-[#141b2d] text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Advanced Filters Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#141b2d]/70 backdrop-blur-md p-4 rounded-2xl border border-white/10 max-w-5xl mx-auto text-xs text-gray-300">
          <div className="flex items-center space-x-2">
            <SlidersHorizontal size={15} className="text-blue-400" />
            <span className="font-semibold text-white">Filters:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* AI Model Selector */}
            <div className="flex items-center space-x-1.5">
              <span className="text-gray-400">Model:</span>
              <select
                value={activeModel}
                onChange={(e) => setActiveModel(e.target.value)}
                className="bg-[#0c1121] border border-white/10 rounded-lg px-2.5 py-1 text-white focus:outline-none"
              >
                {AI_MODELS.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>

            {/* Pricing Filter */}
            <div className="flex items-center space-x-1.5">
              <span className="text-gray-400">Pricing:</span>
              <select
                value={activePricing}
                onChange={(e) => setActivePricing(e.target.value)}
                className="bg-[#0c1121] border border-white/10 rounded-lg px-2.5 py-1 text-white focus:outline-none"
              >
                <option value="all">All Tiers</option>
                <option value="free">Free Only</option>
                <option value="paid">Paid Only</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="flex items-center space-x-1.5">
              <span className="text-gray-400">Sort:</span>
              <select
                value={activeSort}
                onChange={(e) => setActiveSort(e.target.value)}
                className="bg-[#0c1121] border border-white/10 rounded-lg px-2.5 py-1 text-white focus:outline-none"
              >
                <option value="trending">Trending (Likes)</option>
                <option value="popular">Most Popular (Sales)</option>
                <option value="newest">Newest Listed</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          <div className="text-gray-400">
            {totalCount} {totalCount === 1 ? 'prompt' : 'prompts'} found
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : prompts.length > 0 ? (
          prompts.map((item) => (
            <Card
              key={item._id}
              id={item._id}
              imageSrc={item.imageUrl}
              prompt={item.promptText}
              likes={item.likes}
              author={item.author || 'Anonymous'}
              category={item.category}
              aiModel={item.aiModel}
              pricePaise={item.pricePaise}
              isLiked={likedPrompts.includes(item._id)}
              isLoggedIn={isLoggedIn}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-20">
            <p className="text-lg text-gray-400 mb-2">No matching prompts found.</p>
            <p className="text-sm text-gray-500">
              Try adjusting your search query, model selector, or category filters.
            </p>
          </div>
        )}
      </div>

      {/* Server Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex justify-center items-center mt-14 space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-800 text-white rounded-xl border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-700 transition text-sm font-medium"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={`w-9 h-9 rounded-xl text-sm font-semibold transition ${
                currentPage === pageNum
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-gray-800/80 text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-800 text-white rounded-xl border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-700 transition text-sm font-medium"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ExploreGallery;
