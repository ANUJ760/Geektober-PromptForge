const SkeletonCard = () => {
  return (
    <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-700 w-80 flex flex-col animate-pulse">
      <div className="h-48 bg-gray-700" />

      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-700 rounded w-3/4" />
        <div className="h-4 bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-700 rounded w-2/3" />

        <div className="flex justify-between pt-4">
          <div className="h-8 w-20 bg-gray-700 rounded-lg" />
          <div className="h-8 w-20 bg-gray-700 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
