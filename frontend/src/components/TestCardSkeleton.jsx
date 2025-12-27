import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const TestCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden min-w-[300px] max-w-[300px] border border-gray-100">
      {/* Top Section Skeleton */}
      <div className="p-6 relative overflow-hidden bg-gray-100">
        <Skeleton height={24} width="80%" className="mb-2" />
        <Skeleton height={16} width="60%" />
        <div className="mt-4 flex justify-end">
          <Skeleton circle width={80} height={80} />
        </div>
      </div>
      
      {/* Bottom Section Skeleton */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <Skeleton width={60} height={12} />
          <Skeleton width={80} height={12} />
        </div>
        
        <Skeleton height={20} width="90%" className="mb-2" />
        <Skeleton height={16} width="100%" className="mb-1" />
        <Skeleton height={16} width="70%" className="mb-4" />
        
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <Skeleton width={50} height={12} />
          <Skeleton width={80} height={16} />
        </div>
      </div>
    </div>
  );
};

export default TestCardSkeleton;
