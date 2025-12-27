import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const AdminTableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Table Header */}
      <div className="flex items-center justify-between mb-4">
        <Skeleton width={150} height={24} />
        <Skeleton width={100} height={36} />
      </div>
      
      {/* Table Rows */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Skeleton width="70%" height={20} className="mb-2" />
                <Skeleton width="50%" height={16} />
              </div>
              <div className="flex gap-2">
                <Skeleton width={60} height={32} />
                <Skeleton width={60} height={32} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminTableSkeleton;
