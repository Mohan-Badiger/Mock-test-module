import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const AdminTestCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Card Image/Header */}
      <div className="h-32 bg-gray-100">
        <Skeleton height={128} />
      </div>
      
      {/* Card Content */}
      <div className="p-4 sm:p-6">
        <Skeleton width="80%" height={24} className="mb-2" />
        <Skeleton width="60%" height={16} className="mb-4" />
        
        {/* Stats */}
        <div className="flex items-center gap-4 mb-4">
          <Skeleton width={80} height={20} />
          <Skeleton width={80} height={20} />
        </div>
        
        {/* Buttons */}
        <div className="flex gap-2">
          <Skeleton width={80} height={36} />
          <Skeleton width={80} height={36} />
          <Skeleton width={80} height={36} />
        </div>
      </div>
    </div>
  );
};

export default AdminTestCardSkeleton;
