import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resultAPI, questionAPI } from '../utils/api';
import Profile from '../components/Profile';
import ResultsSkeleton from '../components/ResultsSkeleton';

const Results = () => {
  const { testId, attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [summary, setSummary] = useState(null);
  const [activeTab, setActiveTab] = useState('performance');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const [attemptRes, summaryRes] = await Promise.all([
          resultAPI.getAttemptDetails(attemptId),
          resultAPI.getTestSummary(attemptId)
        ]);

        setAttempt(attemptRes.data);
        setSummary(summaryRes.data);

        // Generate AI analysis
        try {
          const analysisRes = await resultAPI.generateAnalysis(attemptId);
          setAnalysis(analysisRes.data);
        } catch (err) {
          console.error('Error generating analysis:', err);
          // Fallback if AI fails
          setAnalysis({
            strengths: "Unable to generate AI analysis at this time.",
            areasForImprovement: ["Please review your incorrect answers manually."]
          });
        }
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [attemptId]);

  if (loading || !attempt) {
    return (
      <>
        <Profile />
        <ResultsSkeleton />
      </>
    );
  }

  const correctCount = attempt.total_score || 0;
  const incorrectCount = attempt.questions_attempted - correctCount;
  const unattemptedCount = attempt.total_questions - attempt.questions_attempted;

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <Profile />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Section - Test Summary */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">
              Computer Fundamentals - Skill Test
            </h1>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span className="text-gray-700">
                    <span className="font-bold">Total Score:</span> {correctCount}/{attempt.total_questions}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                    <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span className="text-gray-700">
                    <span className="font-bold">Questions:</span> {attempt.total_questions}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span className="text-gray-700">
                    <span className="font-bold">Correct:</span> {correctCount}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                    <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span className="text-red-600">
                    <span className="font-bold">Incorrect:</span> {incorrectCount}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                    <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span className="text-gray-500">
                    <span className="font-bold">Unattempted:</span> {unattemptedCount}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 no-print">
              <button
                onClick={() => navigate('/')}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Go to Home
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Download Report
              </button>
            </div>
          </div>

          {/* Right Section - Performance Analysis */}
          <div className="lg:col-span-2">
            <div className="flex gap-4 mb-6 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('performance')}
                className={`pb-3 px-4 font-medium transition-colors ${activeTab === 'performance'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                Performance Analysis
              </button>
              <button
                onClick={() => setActiveTab('review')}
                className={`pb-3 px-4 font-medium transition-colors ${activeTab === 'review'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                Question Review
              </button>
            </div>

            {activeTab === 'performance' && analysis && (
              <div className="space-y-6">
                {/* Strengths */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-blue-500">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" fill="none" />
                      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" fill="none" />
                    </svg>
                    <h3 className="text-xl font-bold text-gray-800">Strengths</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{analysis.strengths}</p>
                </div>

                {/* Areas for Improvement */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-blue-500">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
                    </svg>
                    <h3 className="text-xl font-bold text-gray-800">Areas for Improvement</h3>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {analysis.areasForImprovement.map((item, index) => (
                      <div key={index} className="text-gray-700 leading-relaxed">
                        {item.split('**').map((part, i) =>
                          i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'review' && (
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Total Questions</span>
                    <span className="text-xl font-bold text-gray-800">{attempt.total_questions}</span>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100 flex items-center justify-between">
                    <span className="text-green-700 font-medium">Correct</span>
                    <span className="text-xl font-bold text-green-700">{correctCount}</span>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-red-100 flex items-center justify-between">
                    <span className="text-red-700 font-medium">Incorrect</span>
                    <span className="text-xl font-bold text-red-700">{incorrectCount}</span>
                  </div>
                </div>

                {/* Questions List */}
                <div className="space-y-4">
                  {summary?.questions?.map((q, index) => (
                    <div
                      key={q.question_id}
                      className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${q.is_correct
                        ? 'border-green-500'
                        : q.is_skipped
                          ? 'border-gray-400'
                          : 'border-red-500'
                        }`}
                    >
                      <div className="flex items-start gap-4">
                        <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full font-bold text-gray-600 text-sm">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">{q.question_text}</h3>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                            {q.options && q.options.map((option, optIndex) => {
                              const isSelected = q.selected_option === option;
                              const isCorrect = q.correct_answer === option;

                              let optionClass = "p-3 rounded-lg border text-sm transition-colors ";

                              if (isCorrect) {
                                optionClass += "bg-green-50 border-green-200 text-green-800 font-medium";
                              } else if (isSelected && !isCorrect) {
                                optionClass += "bg-red-50 border-red-200 text-red-800";
                              } else {
                                optionClass += "bg-gray-50 border-gray-200 text-gray-600";
                              }

                              return (
                                <div key={optIndex} className={optionClass}>
                                  <div className="flex items-center gap-2">
                                    {isCorrect && (
                                      <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                    {!isCorrect && isSelected && (
                                      <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    )}
                                    <span>{option}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {q.explanation && (
                            <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
                              <span className="font-bold block mb-1">Explanation:</span>
                              {q.explanation}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;

