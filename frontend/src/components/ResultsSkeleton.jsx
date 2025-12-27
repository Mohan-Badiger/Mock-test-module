import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const ResultsSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header Skeleton */}
        <div className="text-center mb-8">
          <Skeleton width={300} height={40} className="mx-auto mb-4" />
          <Skeleton width={200} height={20} className="mx-auto" />
        </div>

        {/* Score Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6">
              <Skeleton width={80} height={20} className="mb-2" />
              <Skeleton width={60} height={36} />
            </div>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="flex gap-2 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} width={120} height={40} />
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <Skeleton count={5} height={60} className="mb-4" />
        </div>

        {/* Buttons Skeleton */}
        <div className="flex justify-center gap-4 mt-8">
          <Skeleton width={150} height={48} />
          <Skeleton width={150} height={48} />
        </div>
      </div>
    </div>
  );
};

export default ResultsSkeleton;
