import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { questionAPI, answerAPI, resultAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Profile from '../components/Profile';
import QuestionSkeleton from '../components/QuestionSkeleton';
import QuestionSummaryModal from '../components/QuestionSummaryModal';

const ExamInterface = () => {
  const { testId, attemptId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(56); // seconds for current question
  const [showSummary, setShowSummary] = useState(false);
  const [loading, setLoading] = useState(true);//loading
  const [isTimeExpired, setIsTimeExpired] = useState(false); // Track if time has expired
  const navigatorRef = useRef(null);
  const currentQuestionRef = useRef(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        // Get difficulty from attempt
        const attemptResponse = await resultAPI.getAttemptDetails(attemptId);
        const difficultyId = attemptResponse.data.difficulty_id;
        
        let response = await questionAPI.getByTestAndDifficulty(testId, difficultyId);
        // Fallback: if no questions for selected difficulty, load all questions for test
        if (!response.data || response.data.length === 0) {
          response = await questionAPI.getByTest(testId);
        }
        setQuestions(response.data || []);
        
        // Load saved answers
        const answersResponse = await answerAPI.getAnswersByAttempt(attemptId);
        const savedAnswers = {};
        answersResponse.data.forEach(answer => {
          savedAnswers[answer.question_id] = answer.selected_option_id;
        });
        setAnswers(savedAnswers);
        
        // Set current question's selected option
        if (response.data.length > 0) {
          const currentQId = response.data[0].id;
          setSelectedOption(savedAnswers[currentQId] || null);
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [testId, attemptId]);

  useEffect(() => {
    // Reset time expired flag and timer when question changes
    setIsTimeExpired(false);
    setTimeLeft(56);
    
    // Question timer countdown
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsTimeExpired(true); // Disable buttons when time expires
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex]);

  // Handle auto-advance when time expires
  useEffect(() => {
    if (isTimeExpired && currentQuestionIndex < questions.length - 1) {
      // Auto-advance to next question after 2 seconds
      const advanceTimer = setTimeout(() => {
        // Mark current question as attempted (even if not answered)
        const question = questions[currentQuestionIndex];
        if (!answers[question.id]) {
          setAnswers(prev => ({ ...prev, [question.id]: null }));
        }
        // Move to next question
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedOption(null);
      }, 2000);

      return () => clearTimeout(advanceTimer);
    }
  }, [isTimeExpired, currentQuestionIndex, questions, answers]);

  // Auto-scroll navigator to current question
  useEffect(() => {
    if (currentQuestionRef.current && navigatorRef.current) {
      const element = currentQuestionRef.current;
      const container = navigatorRef.current;
      const elementLeft = element.offsetLeft;
      const containerWidth = container.offsetWidth;
      const elementWidth = element.offsetWidth;
      
      // Scroll to center the current question
      container.scrollTo({
        left: elementLeft - (containerWidth / 2) + (elementWidth / 2),
        behavior: 'smooth'
      });
    }
  }, [currentQuestionIndex]);

  const handleOptionSelect = (optionId) => {
    setSelectedOption(optionId);
  };

  const handleSubmitAndNext = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    const isLast = currentQuestionIndex === questions.length - 1;
    if (selectedOption) {
      try {
        await answerAPI.submitAnswer({
          attempt_id: parseInt(attemptId),
          question_id: currentQuestion.id,
          selected_option_id: selectedOption,
          time_spent_seconds: 56 - timeLeft,
          is_skipped: false
        });
        
        setAnswers({ ...answers, [currentQuestion.id]: selectedOption });
      } catch (error) {
        console.error('Error submitting answer:', error);
      }
    }
    
    if (isLast) {
      setShowSummary(true);
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      const nextQuestion = questions[currentQuestionIndex + 1];
      setSelectedOption(answers[nextQuestion.id] || null);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTimeLeft(56);
    }
  };

  const handleSkip = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    try {
      await answerAPI.submitAnswer({
        attempt_id: parseInt(attemptId),
        question_id: currentQuestion.id,
        selected_option_id: null,
        time_spent_seconds: 56 - timeLeft,
        is_skipped: true
      });
    } catch (error) {
      console.error('Error skipping question:', error);
    }
    
    if (currentQuestionIndex < questions.length - 1) {
      const nextQuestion = questions[currentQuestionIndex + 1];
      setSelectedOption(answers[nextQuestion.id] || null);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTimeLeft(56);
    }
  };

  const handleFinish = () => {
    setShowSummary(true);
  };

  const handleFinalFinish = async () => {
    try {
      await resultAPI.finishAttempt({ attempt_id: parseInt(attemptId) });
      // Notify other tabs/pages to refresh history
      try { localStorage.setItem('lastAttemptCompleted', String(Date.now())); } catch (_) {}
      navigate(`/test/${testId}/results/${attemptId}`);
    } catch (error) {
      console.error('Error finishing test:', error);
    }
  };

  if (loading) {
    return <QuestionSkeleton />;
  }

  if (!loading && questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="text-center max-w-lg bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
          <div className="mb-4">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="mx-auto text-gray-500">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Exam Prepared</h2>
          <p className="text-gray-600 mb-6">
            There is not exam prepared for this level or course yet. Coming soon. Please try a different difficulty level or come back later.
          </p>
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
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const attemptedCount = Object.keys(answers).length;
  const skippedCount = questions.filter((q, idx) => idx < currentQuestionIndex && !answers[q.id]).length;

  return (
    <div className="min-h-screen bg-gray-100">
      <Profile />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
              U
            </div>
            <h1 className="text-base sm:text-lg font-semibold text-gray-800">Computer Fundamentals - Skill Test</h1>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <div 
              ref={navigatorRef}
              className="flex items-center gap-1 sm:gap-2 max-w-xs sm:max-w-md overflow-x-auto scrollbar-hide pb-1 pointer-events-none"
            >
              {questions.map((_, i) => (
                <div
                  key={i}
                  ref={i === currentQuestionIndex ? currentQuestionRef : null}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded text-xs sm:text-sm flex-shrink-0 flex items-center justify-center ${
                    i === currentQuestionIndex
                      ? 'bg-gray-800 text-white'
                      : answers[questions[i]?.id]
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-400 opacity-50'
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
            
            <div className={`font-medium text-xs sm:text-sm ${isTimeExpired ? 'text-red-700 font-bold' : 'text-red-600'} whitespace-nowrap`}>
              <span className="hidden sm:inline">Question Time Left </span>
              <span className="inline-block min-w-[45px] text-center">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
              {isTimeExpired && <span className="ml-2 text-xs">(Expired)</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 sm:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Question Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xl font-bold text-gray-800">Question {currentQuestionIndex + 1}</h2>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                {currentQuestion.difficulty_name?.toUpperCase() || 'MEDIUM'}
              </span>
            </div>
            <p className="text-gray-700 leading-relaxed">{currentQuestion.question_text}</p>
          </div>

          {/* Answer Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Answer</h2>
            <div className="space-y-3">
              {currentQuestion.options?.map((option) => (
                <label
                  key={option.id}
                  className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedOption === option.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="answer"
                    value={option.id}
                    checked={selectedOption === option.id}
                    onChange={() => handleOptionSelect(option.id)}
                    className="mt-1"
                  />
                  <span className="text-gray-700">{option.option_text}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0">
          <button
            onClick={handleFinish}
            className="px-4 sm:px-6 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors text-sm sm:text-base order-2 sm:order-1"
          >
            Finish
          </button>
          
          <div className="flex gap-2 sm:gap-3 order-1 sm:order-2">
            <button
              onClick={handleSkip}
              disabled={isTimeExpired}
              className={`px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                isTimeExpired
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Skip
            </button>
            <button
              onClick={handleSubmitAndNext}
              disabled={isTimeExpired}
              className={`px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                isTimeExpired
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : selectedOption
                  ? (currentQuestionIndex === questions.length - 1
                      ? 'bg-orange-500 text-white hover:bg-orange-600'
                      : 'bg-blue-600 text-white hover:bg-blue-700')
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {currentQuestionIndex === questions.length - 1 ? 'Submit' : 'Submit & Next'}
            </button>
          </div>
        </div>
      </div>

      {showSummary && (
        <QuestionSummaryModal
          questions={questions}
          answers={answers}
          currentIndex={currentQuestionIndex}
          attemptId={attemptId}
          onClose={() => setShowSummary(false)}
          onFinish={handleFinalFinish}
        />
      )}
    </div>
  );
};

export default ExamInterface;

