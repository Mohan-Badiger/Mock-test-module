import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { testAPI, resultAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ModernTestCard from '../components/ModernTestCard';
import TestCardSkeleton from '../components/TestCardSkeleton';
import CategoryTabs from '../components/CategoryTabs';
import Profile from '../components/Profile';
import AuthModal from '../components/AuthModal';
import ResultModal from '../components/ResultModal';

const Home = () => {
  const [activeTab, setActiveTab] = useState('Tech');
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [testHistory, setTestHistory] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        const response = await testAPI.getAll(activeTab.toLowerCase());
        // Handle both array (legacy) and object (paginated) responses
        const testsData = Array.isArray(response.data) ? response.data : (response.data.tests || []);
        setTests(testsData);
      } catch (error) {
        console.error('Error fetching tests:', error);
        setTests([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, [activeTab]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        if (!user?.id) return;
        const res = await resultAPI.getTestHistory(user.id);
        setTestHistory(res.data || []);
      } catch (e) {
        // ignore errors
      }
    };
    fetchHistory();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <Profile />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] leading-tight font-extrabold text-gray-900 mb-1">
              AI-Powered Skill Based <span className="text-blue-600">Mock Tests</span>
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Master your concepts with AI-powered full-length mock tests for 360° preparation!
            </p>
          </div>
          <button
            onClick={() => navigate('/view-all')}
            className="text-blue-600 font-semibold flex items-center gap-1 hover:text-blue-700 whitespace-nowrap"
          >
            View all
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Category Tabs */}
        <CategoryTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Test Cards Carousel - Updated to Grid/Flex for better modern look */}
        <div className="relative">
          {loading ? (
            <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="min-w-[280px] sm:min-w-[320px] snap-center">
                  <TestCardSkeleton />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x items-stretch">
              {tests.map((test) => (
                <div key={test.id} className="min-w-[280px] sm:min-w-[320px] snap-center h-full">
                  <ModernTestCard test={test} />
                </div>
              ))}
              {tests.length === 0 && (
                <div className="text-center py-12 text-gray-500 w-full bg-white rounded-2xl border border-dashed border-gray-200">
                  No tests available in this category
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recent History */}
        {user?.id && (
          <div className="mt-8 sm:mt-10">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Recent Test History</h2>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-3 gap-2 sm:gap-4 p-3 sm:p-4 bg-gray-50 border-b border-gray-200 font-medium text-xs sm:text-sm text-gray-700">
                <div className="truncate pl-8 sm:pl-0">Test</div>
                <div className="text-center">Score</div>
                <div className="text-right hidden sm:block">Date</div>
                <div className="text-right sm:hidden">Date</div>
              </div>
              <div className="divide-y divide-gray-200">
                {testHistory && testHistory.length > 0 ? (
                  testHistory.slice(0, 5).map((h) => (
                    <div key={h.attempt_id} className="grid grid-cols-3 gap-2 sm:gap-4 p-3 sm:p-4 text-xs sm:text-sm relative group">
                      <div className="flex items-center gap-2 min-w-0">
                        {/* Mobile Action Button - Absolute positioned left */}
                        <button
                          onClick={() => setSelectedResult(h)}
                          className="absolute left-2 sm:hidden text-blue-600 p-1 -ml-1"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M10 6L14 2M14 2H10M14 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M8 14H4C2.89543 14 2 13.1046 2 12V4C2 2.89543 2.89543 2 4 2H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <div className="text-gray-800 truncate pl-6 sm:pl-0">{h.test_title}</div>
                      </div>
                      <div className="text-gray-800 text-center flex items-center justify-center">{h.total_score}/{h.total_questions}</div>
                      <div className="text-gray-600 text-right text-xs flex items-center justify-end">
                        {h.completed_at ? new Date(h.completed_at).toLocaleDateString() : '-'}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-gray-500 text-sm">No recent tests</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Result Modal */}
      <ResultModal
        result={selectedResult}
        onClose={() => setSelectedResult(null)}
      />
    </div>

  );
};

export default Home;

