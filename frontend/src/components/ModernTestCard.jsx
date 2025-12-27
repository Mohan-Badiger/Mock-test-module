import { useNavigate } from 'react-router-dom';

const ModernTestCard = ({ test }) => {
  const navigate = useNavigate();

  const handleStartTest = () => {
    navigate(`/test/${test.id}/difficulty`);
  };

  // Define gradient colors based on test id or category for variety
  // Using brighter, more "modern" gradients (yellows, blues, etc. as seen in reference)
  const gradients = [
    'bg-gradient-to-br from-yellow-400 to-orange-500', // Financial/Yellow
    'bg-gradient-to-br from-blue-400 to-blue-600',     // Tech/Blue
    'bg-gradient-to-br from-emerald-400 to-teal-600',   // Green
    'bg-gradient-to-br from-purple-400 to-indigo-600',  // Purple
    'bg-gradient-to-br from-rose-400 to-red-600',       // Red
  ];

  const gradientClass = gradients[test.id % gradients.length];

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full group">
      {/* Top Gradient Section - Reduced height */}
      <div className={`${gradientClass} p-5 relative overflow-hidden h-32 shrink-0`}>
        {/* Background Pattern - Subtle geometric shapes */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/30 blur-xl"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/20 rotate-45 transform translate-y-1/2 -translate-x-1/2"></div>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 h-full flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-lg inline-flex">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M4 7V17C4 19.2091 5.79086 21 8 21H16C18.2091 21 20 19.2091 20 17V7M4 7L12 11L20 7M4 7L12 3L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {/* Optional: Company logo placeholder if available */}
            {test.company_name && (
              <span className="text-[10px] font-bold bg-white/90 text-gray-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                {test.company_name}
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold text-white leading-tight line-clamp-2 drop-shadow-sm">
            {test.title}
          </h3>
        </div>

        {/* Illustration Placeholder - Bottom Right */}
        <div className="absolute -bottom-2 -right-2 w-20 h-20 opacity-90">
          {/* This would ideally be a specific image per test, but using a generic SVG for now */}
          <svg viewBox="0 0 100 100" fill="none" className="w-full h-full text-white/20">
            <circle cx="50" cy="50" r="40" fill="currentColor" />
          </svg>
        </div>
      </div>

      {/* Bottom White Section */}
      <div className="p-4 flex-1 flex flex-col justify-between bg-white">
        <div className="mb-4">
          <h4 className="font-bold text-gray-900 mb-1 line-clamp-1 text-base">{test.title}</h4>
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {test.tagline || test.description || 'Master this skill with our comprehensive mock test.'}
          </p>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <span className="text-xs font-medium text-gray-400">Start Test</span>
          <button
            onClick={handleStartTest}
            className="w-8 h-8 rounded-full bg-gray-50 hover:bg-blue-50 text-gray-400 hover:text-blue-600 flex items-center justify-center transition-colors group-hover:bg-blue-600 group-hover:text-white"
            aria-label="Start Test"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14m-7-7l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModernTestCard;
