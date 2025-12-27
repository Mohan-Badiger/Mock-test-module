import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const TestInfoSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Left Section */}
          <div>
            <Skeleton height={40} width={300} className="mb-6" />
            <div className="space-y-4">
              <Skeleton height={24} width={200} />
              <Skeleton height={24} width={180} />
            </div>
          </div>

          {/* Right Section */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <Skeleton height={30} width={150} className="mb-4" />
              <div className="space-y-3">
                <Skeleton count={5} height={20} />
              </div>
              <div className="mt-6 flex gap-3">
                <Skeleton height={40} className="flex-1" />
                <Skeleton height={40} width={100} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestInfoSkeleton;
