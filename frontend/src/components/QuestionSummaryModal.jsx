const QuestionSummaryModal = ({ questions, answers, currentIndex, attemptId, onClose, onFinish }) => {
  const attemptedCount = Object.keys(answers).length;
  const skippedCount = questions.length - attemptedCount;

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
      <div className="bg-white w-full md:w-96 h-full overflow-y-auto shadow-xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Question Summary</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Warning Box */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-red-600 mt-0.5">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <div className="flex-1">
                <p className="text-red-800 font-medium mb-1">There is time left.</p>
                <p className="text-red-700 text-sm">Are you sure you want to finish the assessment?</p>
              </div>
              <div className="flex items-center gap-1 text-red-600">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span className="text-sm font-medium">0h 27m 48s</span>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="mb-6">
            <div className="flex items-center gap-6 mb-4">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-800">{questions.length}</span>
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Questions Attempted:</span>
                    <span className="text-sm font-medium text-gray-800">{attemptedCount}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(attemptedCount / questions.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Questions Skipped:</span>
                    <span className="text-sm font-medium text-gray-800">{skippedCount}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gray-400 h-2 rounded-full border-2 border-dashed border-gray-500"
                      style={{ width: `${(skippedCount / questions.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Questions Grid */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Questions Summary</h3>
            <div className="flex items-center gap-4 mb-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-gray-600">Que attempt</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <span className="text-gray-600">Not attempt</span>
              </div>
            </div>
            <div className="grid grid-cols-10 gap-2">
              {questions.map((question, index) => {
                const isAttempted = answers[question.id];
                const isCurrent = index === currentIndex;
                return (
                  <button
                    key={question.id}
                    className={`w-10 h-10 rounded text-sm font-medium ${
                      isCurrent
                        ? 'bg-gray-800 text-white'
                        : isAttempted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={onFinish}
              className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              Finish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionSummaryModal;

