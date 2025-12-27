import { useNavigate } from 'react-router-dom';

const TestCard = ({ test }) => {
  const navigate = useNavigate();

  const handleStartTest = () => {
    navigate(`/test/${test.id}/difficulty`);
  };

  // Define gradient colors based on test id or category for variety
  const gradients = [
    'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600',
    'bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600',
    'bg-gradient-to-br from-pink-400 via-pink-500 to-pink-600',
    'bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600',
    'bg-gradient-to-br from-cyan-400 via-cyan-500 to-cyan-600',
    'bg-gradient-to-br from-teal-400 via-teal-500 to-teal-600',
    'bg-gradient-to-br from-green-400 via-green-500 to-green-600',
    'bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600',
  ];

  // Select gradient based on test id for consistency
  const gradientClass = gradients[test.id % gradients.length];

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden min-w-[300px] max-w-[300px] border border-gray-100 h-[24rem] flex flex-col">
      {/* Top Gradient Section */}
      <div className={`${gradientClass} p-6 relative overflow-hidden h-48 flex flex-col justify-between shrink-0`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-4">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-white">
              <rect x="4" y="4" width="16" height="16" stroke="currentColor" strokeWidth="2" />
              <rect x="8" y="8" width="8" height="8" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
          <div className="absolute bottom-4 right-4">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" className="text-white">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
        </div>

        <div className="relative z-10">
          <h3 className="text-xl font-extrabold text-white mb-2 line-clamp-2">{test.title}</h3>
          <p className="text-sm text-white/90 line-clamp-2">{test.tagline || 'Test your knowledge'}</p>
        </div>

        <div className="flex justify-end relative z-10">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </div>
        </div>
      </div>

      {/* Bottom White Section */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {test.category_name || 'Tech'}
            </span>
            <span className="text-xs font-semibold text-gray-600">
              {test.total_questions || 30} Questions
            </span>
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{test.title}</h3>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{test.description || test.tagline}</p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            <span className="font-medium">{test.duration_minutes || 60} min</span>
          </div>

          <button
            onClick={handleStartTest}
            className="text-blue-600 font-semibold hover:text-blue-700 transition-colors flex items-center gap-1 group"
          >
            Start Test
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="group-hover:translate-x-1 transition-transform">
              <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestCard;

