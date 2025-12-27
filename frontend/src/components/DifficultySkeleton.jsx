import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const DifficultySkeleton = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="w-full max-w-5xl px-4 sm:px-6">
        <Skeleton height={40} width={300} className="mx-auto mb-12" />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6 mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white">
              <Skeleton height={120} className="rounded-lg" />
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Skeleton height={48} width={120} />
        </div>
      </div>
    </div>
  );
};

export default DifficultySkeleton;
