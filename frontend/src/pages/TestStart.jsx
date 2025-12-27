import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { testAPI } from '../utils/api';
import Profile from '../components/Profile';
import TestInfoSkeleton from '../components/TestInfoSkeleton';

const TestStart = () => {
  const { testId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const attemptId = searchParams.get('attemptId');
  const [test, setTest] = useState(null);
  const [startInput, setStartInput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const response = await testAPI.getById(testId);
        setTest(response.data);
      } catch (error) {
        console.error('Error fetching test:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [testId]);

  const handleStart = () => {
    if (startInput.toLowerCase() === 'start' && attemptId) {
      navigate(`/test/${testId}/exam/${attemptId}`);
    }
  };

  if (loading || !test) {
    return (
      <>
        <Profile />
        <TestInfoSkeleton />
      </>
    );
  }

  const formatTime = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const secs = 0;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <Profile />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Left Section - Test Overview */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">
              {test.title} - Skill Test
            </h1>
            
            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              <div className="flex items-center gap-2 sm:gap-3">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span className="text-sm sm:text-base text-gray-700">
                  <span className="font-medium">Questions:</span> {test.total_questions}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span className="text-sm sm:text-base text-gray-700">
                  <span className="font-medium">Marks:</span> {test.total_marks}
                </span>
              </div>
            </div>
          </div>

          {/* Right Section - Guidelines */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Guidelines</h2>
              </div>

              <div className="mb-4 sm:mb-6">
                <h3 className="text-sm sm:text-base font-semibold text-gray-700 mb-2 sm:mb-3">Timelines & Questions</h3>
                <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 flex-shrink-0">•</span>
                    <span>Assessment Duration: {formatTime(test.duration_minutes)} (hh:mm:ss)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 flex-shrink-0">•</span>
                    <span>Total Questions to be answered: {test.total_questions} Questions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 flex-shrink-0">•</span>
                    <span>Do not close the window or tab if you wish to continue the application.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 flex-shrink-0">•</span>
                    <span>Please ensure that you attempt the assessment in one sitting as once you start the assessment, the timer won't stop.</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={startInput}
                  onChange={(e) => setStartInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleStart()}
                  placeholder='Type "start" to Start'
                  className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleStart}
                  disabled={startInput.toLowerCase() !== 'start'}
                  className={`px-4 sm:px-6 py-2 text-sm sm:text-base rounded-lg font-medium transition-colors whitespace-nowrap ${
                    startInput.toLowerCase() === 'start'
                      ? 'bg-gray-700 text-white hover:bg-gray-800'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Start →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestStart;

