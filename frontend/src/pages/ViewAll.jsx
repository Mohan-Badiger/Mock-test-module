import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { testAPI, resultAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ModernTestCard from '../components/ModernTestCard';
import TestCardSkeleton from '../components/TestCardSkeleton';
import CategoryTabs from '../components/CategoryTabs';
import Profile from '../components/Profile';
import ResultModal from '../components/ResultModal';


const ViewAll = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [tests, setTests] = useState([]);
  const [testHistory, setTestHistory] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const category = activeTab === 'All' ? null : activeTab.toLowerCase();
        const response = await testAPI.getAll(category, page, 8);

        const newTests = response.data.tests || [];
        const pagination = response.data.pagination;

        if (page === 1) {
          setTests(newTests);
        } else {
          setTests(prev => [...prev, ...newTests]);
        }

        // Check if we have more pages
        if (pagination) {
          setHasMore(page < pagination.totalPages);
        } else {
          // Fallback if backend doesn't return pagination (shouldn't happen with update)
          setHasMore(newTests.length === 8);
        }

        // Fetch test history only if user is logged in (only on first load)
        if (user?.id && page === 1) {
          const historyResponse = await resultAPI.getTestHistory(user.id);
          setTestHistory(historyResponse.data || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab, page, user]);

  // Reset pagination when tab changes
  const handleTabChange = (tab) => {
    if (tab !== activeTab) {
      setActiveTab(tab);
      setPage(1);
      setTests([]);
      setHasMore(true);
    }
  };

  // Refresh history when returning from Results/Exam via storage signal or tab focus
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'lastAttemptCompleted' && user?.id) {
        resultAPI.getTestHistory(user.id).then(r => setTestHistory(r.data || [])).catch(() => { });
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && user?.id) {
        resultAPI.getTestHistory(user.id).then(r => setTestHistory(r.data || [])).catch(() => { });
      }
    };
    window.addEventListener('storage', onStorage);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('storage', onStorage);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [user]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  // Infinite scroll observer
  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loading]);

  return (
    <div className="min-h-screen bg-gray-50 relative flex flex-col">
      <Profile />

      {/* Hero Banner */}
      <div className="w-full bg-gradient-to-r from-purple-100 to-blue-100 relative overflow-hidden border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12 flex flex-col items-start justify-center relative z-10">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold mb-3 shadow-sm tracking-wide uppercase">
              AI-Powered
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-3 tracking-tight">
              Skill Based Mock Tests
            </h1>
            <p className="text-base sm:text-lg text-gray-700 max-w-2xl">
              Excel with AI-powered full-length mock tests for skill mastery
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full items-start">
          {/* Main Content */}
          <div className="lg:col-span-2 flex flex-col">

            <h2 className="text-2xl font-bold text-gray-800 mb-6">Choose From The Top Roles</h2>

            {/* Category Tabs - Pill Style */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 flex-shrink-0 no-scrollbar">
              {['All', 'Tech', 'Management'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap ${activeTab === tab
                    ? 'bg-white text-gray-900 shadow-md border border-gray-100'
                    : 'bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Test Cards Container - Natural Scroll */}
            <div className="flex flex-col gap-8">
              {loading && tests.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <TestCardSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                    {tests.map((test) => (
                      <ModernTestCard key={test.id} test={test} />
                    ))}
                    {tests.length === 0 && (
                      <div className="col-span-full text-center py-12 text-gray-500 w-full bg-white rounded-2xl border border-dashed border-gray-200">
                        No tests available in this category
                      </div>
                    )}
                  </div>

                  {/* Infinite Scroll Trigger */}
                  {hasMore && (
                    <div ref={observerTarget} className="flex justify-center py-8">
                      {loading && (
                        <div className="flex items-center gap-2 text-gray-500">
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-75"></div>
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-150"></div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Sticky */}
          <div className="space-y-6 lg:sticky lg:top-6 h-fit">
            {/* AI Credits - Modern Look */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                    AI
                  </div>
                  <span className="text-sm font-bold text-gray-800">AI Credits</span>
                </div>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">0/7</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full" style={{ width: '0%' }}></div>
              </div>
            </div>

            {/* Test History - Modern Look */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Test History</h3>
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm max-h-[500px] overflow-y-auto">
                <div className="grid grid-cols-3 gap-2 p-4 bg-gray-50/50 border-b border-gray-100 font-semibold text-xs text-gray-500 uppercase tracking-wider sticky top-0 z-10">
                  <div className="truncate pl-8 sm:pl-0">Category</div>
                  <div className="text-center">Score</div>
                  <div className="text-right">Action</div>
                </div>
                <div className="divide-y divide-gray-200">
                  {testHistory.length > 0 ? (
                    testHistory.slice(0, 10).map((history) => (
                      <div key={history.attempt_id} className="grid grid-cols-3 gap-2 sm:gap-4 p-3 sm:p-4 relative group">
                        <div className="min-w-0 flex items-center">
                          {/* Mobile Action Button - Left Side */}
                          <button
                            onClick={() => setSelectedResult(history)}
                            className="absolute left-2 sm:hidden text-blue-600 p-1 -ml-1"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M10 6L14 2M14 2H10M14 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M8 14H4C2.89543 14 2 13.1046 2 12V4C2 2.89543 2.89543 2 4 2H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                          <div className="pl-6 sm:pl-0">
                            <div className="font-medium text-gray-800 truncate text-sm">{history.test_title}</div>
                            <div className="text-xs text-gray-500">{formatDate(history.completed_at)}</div>
                          </div>
                        </div>
                        <div className="text-gray-800 text-center text-sm font-medium flex items-center justify-center">{history.total_score}/{history.total_questions}</div>
                        <div className="flex gap-2 justify-end items-center">
                          <button className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 flex items-center justify-center transition-colors">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M4 2H2V14H14V12" stroke="currentColor" strokeWidth="1.5" />
                              <path d="M10 6L14 2M14 2H10M14 2V6" stroke="currentColor" strokeWidth="1.5" />
                            </svg>
                          </button>
                          <button className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 flex items-center justify-center transition-colors">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" fill="none" />
                              <path d="M8 4V8L10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500 text-sm">No test history</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Result Modal */}
      <ResultModal
        result={selectedResult}
        onClose={() => setSelectedResult(null)}
      />
    </div>
  );
};

export default ViewAll;

