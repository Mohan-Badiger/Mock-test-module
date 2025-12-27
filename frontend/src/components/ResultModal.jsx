import React from 'react';

const ResultModal = ({ result, onClose }) => {
  if (!result) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl transform transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold pr-4 leading-tight">{result.test_title}</h3>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="mt-2 text-blue-100 text-sm">
            Completed on {formatDate(result.completed_at)}
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="w-24 h-24 rounded-full border-4 border-blue-100 flex items-center justify-center mb-2 relative">
              <svg className="absolute inset-0 w-full h-full -rotate-90 text-blue-600" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${(result.total_score / result.total_questions) * 100}, 100`}
                />
              </svg>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-gray-800">{result.total_score}</span>
                <span className="text-xs text-gray-500">of {result.total_questions}</span>
              </div>
            </div>
            <span className="text-sm font-medium text-gray-600">Total Score</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-xl text-center">
              <div className="text-xs text-gray-500 mb-1">Accuracy</div>
              <div className="font-bold text-gray-800">
                {Math.round((result.total_score / result.total_questions) * 100)}%
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl text-center">
              <div className="text-xs text-gray-500 mb-1">Status</div>
              <div className="font-bold text-green-600">Completed</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultModal;
