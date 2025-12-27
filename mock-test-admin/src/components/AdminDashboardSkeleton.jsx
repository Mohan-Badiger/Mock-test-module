import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const AdminDashboardSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6">
            <Skeleton width={100} height={20} className="mb-2" />
            <Skeleton width={60} height={36} />
          </div>
        ))}
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} width={100} height={40} />
        ))}
      </div>

      {/* Test Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
            <Skeleton height={128} />
            <div className="p-4">
              <Skeleton width="80%" height={24} className="mb-2" />
              <Skeleton width="60%" height={16} className="mb-4" />
              <div className="flex gap-2">
                <Skeleton width={80} height={36} />
                <Skeleton width={80} height={36} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboardSkeleton;
