import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const QuestionSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton circle width={40} height={40} />
            <Skeleton width={200} height={20} />
          </div>
          <Skeleton width={100} height={30} />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Question Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <Skeleton width={150} height={24} className="mb-4" />
            <Skeleton count={3} height={20} className="mb-6" />
            
            {/* Options */}
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4">
                  <Skeleton height={20} />
                </div>
              ))}
            </div>
          </div>

          {/* Question Navigator Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <Skeleton width={180} height={24} className="mb-4" />
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 15 }).map((_, i) => (
                <Skeleton key={i} width={40} height={40} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionSkeleton;
