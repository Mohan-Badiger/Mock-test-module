import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { questionAPI, resultAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Profile from '../components/Profile';

const PreparingAssessment = () => {
  const { testId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const difficultyId = searchParams.get('difficulty');
  const { user } = useAuth();
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Analyzing requirements...');
  const [logs, setLogs] = useState([]);
  const [attemptIdState, setAttemptIdState] = useState(null);
  const [failed, setFailed] = useState(false);
  const intervalRef = useRef(null);
  const isActiveRef = useRef(true);

  useEffect(() => {
    if (!user) return;

    const prepareAssessment = async () => {
      try {
        // Start test attempt (user_id is extracted from token on backend)
        const attemptResponse = await resultAPI.startAttempt({
          test_id: parseInt(testId),
          difficulty_id: parseInt(difficultyId)
        });

        const attemptId = attemptResponse.data.id;
        setAttemptIdState(attemptId);
        setLogs((l) => [...l, `Attempt created #${attemptId}`]);

        // Check if questions already available for this test + difficulty
        try {
          const qRes = await questionAPI.getByTestAndDifficulty(testId, difficultyId);
          if (Array.isArray(qRes.data) && qRes.data.length > 0) {
            setLogs((l) => [...l, `Found ${qRes.data.length} questions. Skipping wait...`]);
            // Skip waiting if questions exist
            if (isActiveRef.current) {
              return navigate(`/test/${testId}/start?attemptId=${attemptId}`);
            }
          }
        } catch (_) {
          // ignore and continue with short loader
          setLogs((l) => [...l, 'Question lookup failed, showing short loader...']);
        }

        // Short animated progress (10 seconds) before moving on
        let elapsed = 0;
        const total = 3; // seconds fast path to avoid long waiting
        const statuses = [
          'Analyzing requirements...',
          'Generating question pool...',
          'Calibrating difficulty...',
          'Finalizing assessment...'
        ];
        intervalRef.current = setInterval(() => {
          elapsed += 1;
          const pct = Math.min(100, Math.floor((elapsed / total) * 100));
          setProgress(pct);
          const phase = Math.min(statuses.length - 1, Math.floor((elapsed / total) * statuses.length));
          setStatusText(statuses[phase]);
          setLogs((l) => [...l, statuses[phase]]);
          if (elapsed >= total) {
            clearInterval(intervalRef.current);
            if (isActiveRef.current) {
              navigate(`/test/${testId}/start?attemptId=${attemptId}`);
            }
          }
        }, 1000);
      } catch (error) {
        console.error('Error preparing assessment:', error);
        // Stop auto navigation and show error state until user navigates
        setFailed(true);
        setProgress(100);
        setStatusText('Assessment not available at the moment');
        setLogs((l) => [...l, 'Failed to prepare assessment.']);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    };

    prepareAssessment();
    // Cleanup on unmount to prevent stray navigation
    return () => {
      isActiveRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [testId, difficultyId, navigate, user]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center relative">
      <Profile />
      
      <div className="text-center px-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          Preparing Your Assessment
        </h1>
        {!failed && (
          <p className="text-gray-600 text-base sm:text-lg mb-6 sm:mb-8">
            Our AI is crafting personalized questions based on your requirements
          </p>
        )}

        {!failed ? (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 max-w-md mx-auto w-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 flex items-center justify-center">
                <div className="h-10 w-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
              </div>
              <div className="flex-1">
                <p className="text-gray-800 font-medium mb-2">{statusText}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            </div>
            {/* Live logs */}
            {logs.length > 0 && (
              <div className="text-left bg-gray-50 border border-gray-200 rounded p-2 max-h-40 overflow-y-auto text-xs text-gray-600">
                {logs.slice(-6).map((line, idx) => (
                  <div key={idx}>• {line}</div>
                ))}
              </div>
            )}
            {/* Allow user to skip waiting */}
            {attemptIdState && (
              <div className="mt-4 text-right">
                <button
                  onClick={() => navigate(`/test/${testId}/start?attemptId=${attemptIdState}`)}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-black"
                >
                  Start Now
                </button>
              </div>
            )}
            <p className="text-xs text-gray-500">This may take up to 30 seconds</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 max-w-lg mx-auto border border-gray-200">
            <div className="mb-3">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="mx-auto text-gray-500">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No Exam Prepared</h2>
            <p className="text-gray-600 mb-6">There is not exam prepared for this level or course yet. Coming soon. You can go back and choose another level or return home.</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => navigate(`/test/${testId}/difficulty`)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Choose Another Level
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        )}

        {!failed && (
          <p className="text-gray-500 text-sm">
            Generating questions... {progress}%
          </p>
        )}
      </div>
    </div>
  );
};

export default PreparingAssessment;

