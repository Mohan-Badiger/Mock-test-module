import { useNavigate } from 'react-router-dom';

const ModernAdminTestCard = ({ test, onEdit, onManageQuestions }) => {
  const navigate = useNavigate();

  // Define gradient colors based on test id or category for variety
  const gradients = [
    'bg-gradient-to-br from-yellow-400 to-orange-500', // Financial/Yellow
    'bg-gradient-to-br from-blue-400 to-blue-600',     // Tech/Blue
    'bg-gradient-to-br from-emerald-400 to-teal-600',   // Green
    'bg-gradient-to-br from-purple-400 to-indigo-600',  // Purple
    'bg-gradient-to-br from-rose-400 to-red-600',       // Red
  ];

  const gradientClass = gradients[test.id % gradients.length];

  const getVisibilityBadge = (visibility) => {
    const styles = {
      public: 'bg-white/20 text-white',
      private: 'bg-gray-800/50 text-white',
      scheduled: 'bg-blue-800/50 text-white'
    };
    return styles[visibility] || styles.public;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full group">
      {/* Top Gradient Section - Reduced height */}
      <div className={`${gradientClass} p-5 relative overflow-hidden h-32 shrink-0`}>
        {/* Background Pattern */}
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

            <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold backdrop-blur-sm ${getVisibilityBadge(test.visibility)}`}>
              {test.visibility || 'public'}
            </span>
          </div>

          <h3 className="text-lg font-bold text-white leading-tight line-clamp-2 drop-shadow-sm">
            {test.title}
          </h3>
        </div>
      </div>

      {/* Bottom White Section */}
      <div className="p-4 flex-1 flex flex-col justify-between bg-white">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
            <span className="font-medium text-gray-700">{test.category_name}</span>
            <span>•</span>
            <span>{test.total_questions} Qs</span>
          </div>
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {test.tagline || test.description || 'No description available.'}
          </p>
        </div>

        <div className="flex gap-2 mt-auto pt-3 border-t border-gray-50">
          <button
            onClick={() => onManageQuestions ? onManageQuestions(test) : navigate(`/tests/${test.id}/questions`)}
            className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg font-semibold hover:bg-blue-100 transition-colors text-xs flex items-center justify-center gap-1"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
            Questions
          </button>
          <button
            onClick={() => onEdit ? onEdit(test) : navigate('/tests', { state: { editTest: test } })}
            className="flex-1 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-xs flex items-center justify-center gap-1"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModernAdminTestCard;
