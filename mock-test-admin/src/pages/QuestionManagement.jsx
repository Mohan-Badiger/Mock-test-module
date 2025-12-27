import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { questionAPI, adminAPI, testAPI } from '../utils/api';
import AdminProfile from '../components/AdminProfile';

const QuestionManagement = () => {
  const { testId } = useParams();
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [difficulties, setDifficulties] = useState([]);
  const [expandedDifficulty, setExpandedDifficulty] = useState(null);
  const [showAIForm, setShowAIForm] = useState({});
  const [showManualForm, setShowManualForm] = useState({});
  const [aiFormData, setAiFormData] = useState({});
  const [manualFormData, setManualFormData] = useState({});
  const [generatedQuestions, setGeneratedQuestions] = useState({});
  const [editingQuestions, setEditingQuestions] = useState({});
  const [jobProgress, setJobProgress] = useState({}); // { difficultyId: progress% }
  const [saveProgress, setSaveProgress] = useState({}); // { difficultyId: progress% }
  const [activeJobs, setActiveJobs] = useState({}); // { difficultyId: jobId }
  const [activeSaveJobs, setActiveSaveJobs] = useState({}); // { difficultyId: jobId }
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    // Load admin data from localStorage
    const adminData = localStorage.getItem('admin');
    if (adminData) {
      try {
        setAdmin(JSON.parse(adminData));
      } catch (e) {
        console.error('Error parsing admin data:', e);
      }
    }

    // Fetch admin profile from backend
    const fetchAdminProfile = async () => {
      try {
        const response = await adminAPI.getProfile();
        setAdmin(response.data);
        localStorage.setItem('admin', JSON.stringify(response.data));
      } catch (error) {
        console.error('Error fetching admin profile:', error);
      }
    };

    fetchAdminProfile();
    fetchData();
  }, [testId]);

  const fetchData = async () => {
    try {
      const [testRes, questionsRes, difficultiesRes] = await Promise.all([
        testAPI.getById(testId),
        questionAPI.getByTest(testId),
        adminAPI.getDifficulties()
      ]);
      setTest(testRes.data);
      const questionsData = Array.isArray(questionsRes.data) ? questionsRes.data : [];
      const difficultiesData = Array.isArray(difficultiesRes.data) ? difficultiesRes.data : [];

      setQuestions(questionsData);
      setDifficulties(difficultiesData);

      // Initialize forms for each difficulty
      const aiInit = {};
      const manualInit = {};
      difficultiesData.forEach(diff => {
        aiInit[diff.id] = {
          company_name: testRes.data?.company_name || '',
          role_position: testRes.data?.role_position || '',
          topic: testRes.data?.title || '',
          topic: testRes.data?.title || '',
          difficulty_level: '3',
          description: '',
          difficulty_level: String(diff.level || '3'),
          description: '',
          count: 30,
          ai_provider: 'openai'
        };
        manualInit[diff.id] = {
          question_text: '',
          marks: 1,
          options: [
            { option_text: '', is_correct: false, option_order: 1 },
            { option_text: '', is_correct: false, option_order: 2 },
            { option_text: '', is_correct: false, option_order: 3 },
            { option_text: '', is_correct: false, option_order: 4 }
          ]
        };
      });
      setAiFormData(aiInit);
      setManualFormData(manualInit);
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage('Error loading data');
      setShowError(true);
    }
  };

  const getQuestionsByDifficulty = (difficultyId) => {
    if (!Array.isArray(questions)) return [];
    return questions.filter(q => q.difficulty_id === difficultyId);
  };

  const handleAIGenerate = async (difficultyId) => {
    const formData = aiFormData[difficultyId];
    if (!formData.company_name || !formData.role_position) {
      setMessage('Company Name and Role/Position are required');
      setShowError(true);
      return;
    }

    setLoading(true);
    setMessage('');
    setJobProgress({ ...jobProgress, [difficultyId]: 0 });
    setActiveJobs({ ...activeJobs, [difficultyId]: 'starting' });

    try {
      // Start generation job
      const startRes = await adminAPI.startGenerationJob({
        topic: formData.topic,
        company_name: formData.company_name,
        role_position: formData.role_position,
        difficulty_level: parseInt(formData.difficulty_level),
        description: formData.description,
        count: parseInt(formData.count),
        ai_provider: formData.ai_provider
      });

      const jobId = startRes.data.jobId;
      setActiveJobs(prev => ({ ...prev, [difficultyId]: jobId }));

      // Poll for status
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await adminAPI.getGenerationStatus(jobId);
          const job = statusRes.data;

          setJobProgress(prev => ({ ...prev, [difficultyId]: job.progress }));

          if (job.status === 'completed') {
            clearInterval(pollInterval);
            setLoading(false);

            const questions = Array.isArray(job.questions) ? job.questions : [];
            setGeneratedQuestions(prev => ({ ...prev, [difficultyId]: questions }));

            const initial = {};
            questions.forEach((q, i) => (initial[i] = q));
            setEditingQuestions(prev => ({ ...prev, [difficultyId]: initial }));

            setActiveJobs(prev => {
              const next = { ...prev };
              delete next[difficultyId];
              return next;
            });
            setJobProgress(prev => {
              const next = { ...prev };
              delete next[difficultyId];
              return next;
            });

          } else if (job.status === 'failed') {
            clearInterval(pollInterval);
            setLoading(false);
            setMessage(job.error || 'Generation failed');
            setShowError(true);
            setActiveJobs(prev => {
              const next = { ...prev };
              delete next[difficultyId];
              return next;
            });
          }
        } catch (e) {
          console.error('Polling error:', e);
          // Don't stop polling on transient network errors, but maybe limit retries in real app
        }
      }, 1000);

    } catch (e) {
      setLoading(false);
      setMessage(e.response?.data?.error || 'Failed to start generation');
      setShowError(true);
    }
  };

  const updateAIField = (difficultyId, field, value) => {
    setAiFormData({
      ...aiFormData,
      [difficultyId]: { ...aiFormData[difficultyId], [field]: value }
    });
  };

  const updateEditingQuestion = (difficultyId, idx, field, value) => {
    setEditingQuestions({
      ...editingQuestions,
      [difficultyId]: {
        ...editingQuestions[difficultyId],
        [idx]: { ...editingQuestions[difficultyId][idx], [field]: value }
      }
    });
  };

  const handleAIApprove = async (difficultyId) => {
    if (!testId || !difficultyId) {
      setMessage('Test and Difficulty are required');
      setShowError(true);
      return;
    }

    const formData = aiFormData[difficultyId];
    setLoading(true);
    setMessage('');
    try {
      // Use edited questions if available, otherwise use generated questions
      const edited = editingQuestions[difficultyId] || {};
      const generated = generatedQuestions[difficultyId] || [];

      // Convert to array format for approval
      const questionsToApprove = Object.keys(edited).length > 0
        ? Object.values(edited).map(q => ({
          question_text: q.question_text || '',
          option_a: q.option_a || '',
          option_b: q.option_b || '',
          option_c: q.option_c || '',
          option_d: q.option_d || '',
          correct_option: q.correct_option || 'A'
        }))
        : generated.map(q => ({
          question_text: q.question_text || '',
          option_a: q.option_a || '',
          option_b: q.option_b || '',
          option_c: q.option_c || '',
          option_d: q.option_d || '',
          correct_option: q.correct_option || 'A'
        }));

      if (questionsToApprove.length === 0) {
        setMessage('No questions to approve');
        setShowError(true);
        setLoading(false);
        return;
      }

      // Initialize progress immediately for better UX
      setSaveProgress(prev => ({ ...prev, [difficultyId]: 0 }));
      setActiveSaveJobs(prev => ({ ...prev, [difficultyId]: 'starting' }));

      // First generate/update preview (to ensure topic exists in DB for cleanup)
      await adminAPI.aiGeneratePreview({
        topic: formData.topic,
        company_name: formData.company_name,
        role_position: formData.role_position,
        difficulty_level: parseInt(formData.difficulty_level),
        description: formData.description,
        count: parseInt(formData.count)
      });

      // Then approve with edited questions (Job-based)
      const startRes = await adminAPI.startApprovalJob({
        topic: formData.topic,
        test_id: parseInt(testId),
        difficulty_id: parseInt(difficultyId),
        questions: questionsToApprove
      });

      const jobId = startRes.data.jobId;
      setActiveSaveJobs(prev => ({ ...prev, [difficultyId]: jobId }));

      // Poll for status
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await adminAPI.getGenerationStatus(jobId);
          const job = statusRes.data;

          setSaveProgress(prev => ({ ...prev, [difficultyId]: job.progress }));

          if (job.status === 'completed') {
            clearInterval(pollInterval);
            setLoading(false);
            setMessage(`Successfully saved ${job.total} questions`);
            setShowSuccess(true);

            setGeneratedQuestions(prev => ({ ...prev, [difficultyId]: [] }));
            setEditingQuestions(prev => ({ ...prev, [difficultyId]: {} }));

            setActiveSaveJobs(prev => {
              const next = { ...prev };
              delete next[difficultyId];
              return next;
            });
            setSaveProgress(prev => {
              const next = { ...prev };
              delete next[difficultyId];
              return next;
            });

            fetchData();
          } else if (job.status === 'failed') {
            clearInterval(pollInterval);
            setLoading(false);
            setMessage(job.error || 'Approval failed');
            setShowError(true);
            setActiveSaveJobs(prev => {
              const next = { ...prev };
              delete next[difficultyId];
              return next;
            });
          }
        } catch (e) {
          console.error('Polling error:', e);
        }
      }, 1000);

    } catch (e) {
      setLoading(false);
      setMessage(e.response?.data?.error || 'Failed to start approval');
      setShowError(true);
    }
  };

  const updateManualOption = (difficultyId, index, field, value) => {
    const newOptions = [...manualFormData[difficultyId].options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setManualFormData({
      ...manualFormData,
      [difficultyId]: { ...manualFormData[difficultyId], options: newOptions }
    });
  };

  const handleManualSubmit = async (difficultyId, e) => {
    e.preventDefault();
    const formData = manualFormData[difficultyId];
    try {
      await questionAPI.create({
        question_text: formData.question_text,
        test_id: parseInt(testId),
        difficulty_id: parseInt(difficultyId),
        marks: formData.marks,
        options: formData.options.filter(opt => opt.option_text.trim() !== '')
      });
      setMessage('Question created successfully');
      setShowSuccess(true);
      setShowManualForm({ ...showManualForm, [difficultyId]: false });
      setManualFormData({
        ...manualFormData,
        [difficultyId]: {
          question_text: '',
          marks: 1,
          options: [
            { option_text: '', is_correct: false, option_order: 1 },
            { option_text: '', is_correct: false, option_order: 2 },
            { option_text: '', is_correct: false, option_order: 3 },
            { option_text: '', is_correct: false, option_order: 4 }
          ]
        }
      });
      fetchData();
    } catch (error) {
      console.error('Error creating question:', error);
      setMessage('Error creating question');
      setShowError(true);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await questionAPI.delete(questionId);
      setMessage('Question deleted successfully');
      setShowSuccess(true);
      fetchData();
    } catch (error) {
      console.error('Error deleting question:', error);
      setMessage('Error deleting question');
      setShowError(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <AdminProfile admin={admin} onAdminUpdate={setAdmin} />
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 pr-14 sm:pr-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          Question Management - {test?.title || 'Loading...'}
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-4 sm:mb-6">
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm sm:text-base"
          >
            ← Back
          </button>
        </div>

        {/* Difficulty Sections */}
        <div className="space-y-4">
          {difficulties.map((difficulty) => {
            const difficultyQuestions = getQuestionsByDifficulty(difficulty.id);
            const isExpanded = expandedDifficulty === difficulty.id;
            const showAI = showAIForm[difficulty.id];
            const showManual = showManualForm[difficulty.id];
            const genQuestions = generatedQuestions[difficulty.id] || [];
            const editQuestions = editingQuestions[difficulty.id] || {};

            return (
              <div key={difficulty.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Difficulty Header */}
                <div
                  className="px-6 py-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedDifficulty(isExpanded ? null : difficulty.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <h2 className="text-xl font-bold text-gray-800">{difficulty.name}</h2>
                      <span className="text-sm text-gray-600">
                        {difficultyQuestions.length} questions
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAIForm({ ...showAIForm, [difficulty.id]: !showAI });
                        }}
                        className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                      >
                        {showAI ? 'Hide AI' : '+ AI Generate'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowManualForm({ ...showManualForm, [difficulty.id]: !showManual });
                        }}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                      >
                        {showManual ? 'Hide Manual' : '+ Manual Entry'}
                      </button>
                      <svg
                        className={`w-5 h-5 text-gray-600 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-6 space-y-6">
                    {/* AI Generation Form */}
                    {showAI && (
                      <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">AI Question Generation</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                            <input
                              type="text"
                              value={aiFormData[difficulty.id]?.company_name || ''}
                              onChange={(e) => updateAIField(difficulty.id, 'company_name', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="e.g., Google, Microsoft"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role/Position *</label>
                            <input
                              type="text"
                              value={aiFormData[difficulty.id]?.role_position || ''}
                              onChange={(e) => updateAIField(difficulty.id, 'role_position', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="e.g., Software Engineer"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                            <input
                              type="text"
                              value={aiFormData[difficulty.id]?.topic || ''}
                              onChange={(e) => updateAIField(difficulty.id, 'topic', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty Level (1-5)</label>
                            <select
                              value={aiFormData[difficulty.id]?.difficulty_level || '3'}
                              onChange={(e) => updateAIField(difficulty.id, 'difficulty_level', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                              <option value="1">1 - Novice</option>
                              <option value="2">2 - Easy</option>
                              <option value="3">3 - Intermediate</option>
                              <option value="4">4 - Master</option>
                              <option value="5">5 - Expert</option>
                            </select>
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description / Context (Optional)</label>
                            <textarea
                              value={aiFormData[difficulty.id]?.description || ''}
                              onChange={(e) => updateAIField(difficulty.id, 'description', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="e.g., Focus on specific concepts..."
                              rows="2"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">AI Provider</label>
                            <div className="flex flex-wrap gap-4">
                              {['openai', 'grok', 'gemini', 'claude'].map(provider => (
                                <label key={provider} className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`aiProvider_${difficulty.id}`}
                                    value={provider}
                                    checked={aiFormData[difficulty.id]?.ai_provider === provider}
                                    onChange={(e) => updateAIField(difficulty.id, 'ai_provider', e.target.value)}
                                    className="text-purple-600 focus:ring-purple-500"
                                  />
                                  <span className="text-sm text-gray-700 capitalize">{provider}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Questions</label>
                            <input
                              type="number"
                              value={aiFormData[difficulty.id]?.count || 30}
                              onChange={(e) => updateAIField(difficulty.id, 'count', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                              min="1"
                              max="50"
                            />
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleAIGenerate(difficulty.id)}
                            disabled={loading}
                            className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:bg-gray-400"
                          >
                            {loading && activeJobs[difficulty.id] ? 'Generating...' : `Generate ${aiFormData[difficulty.id]?.count || 30} Questions`}
                          </button>

                          {/* Progress Bar */}
                          {loading && activeJobs[difficulty.id] && (
                            <div className="flex-1 flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                                <div
                                  className="bg-purple-600 h-2.5 rounded-full transition-all duration-500"
                                  style={{ width: `${jobProgress[difficulty.id] || 0}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600">{jobProgress[difficulty.id] || 0}%</span>
                            </div>
                          )}
                          {genQuestions.length > 0 && (
                            <button
                              onClick={() => handleAIApprove(difficulty.id)}
                              disabled={loading}
                              className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400"
                            >
                              {loading && activeSaveJobs[difficulty.id] ? 'Saving...' : 'Approve & Save'}
                            </button>
                          )}

                          {/* Save Progress Bar */}
                          {loading && activeSaveJobs[difficulty.id] && (
                            <div className="flex-1 flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                                <div
                                  className="bg-green-600 h-2.5 rounded-full transition-all duration-500"
                                  style={{ width: `${saveProgress[difficulty.id] || 0}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600">{saveProgress[difficulty.id] || 0}%</span>
                            </div>
                          )}
                        </div>

                        {/* Generated Questions Preview */}
                        {genQuestions.length > 0 && (
                          <div className="mt-6 space-y-4 max-h-96 overflow-y-auto">
                            <h4 className="font-semibold text-gray-800">Preview & Edit ({genQuestions.length} questions)</h4>
                            {genQuestions.map((q, idx) => (
                              <div key={idx} className="bg-white rounded p-3 border border-gray-200">
                                <label className="block text-xs font-bold text-gray-500 mb-1">Question {idx + 1}</label>
                                <textarea
                                  value={editQuestions[idx]?.question_text || q.question_text || ''}
                                  onChange={(e) => updateEditingQuestion(difficulty.id, idx, 'question_text', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded mb-2 text-sm"
                                  rows="2"
                                />
                                <div className="grid grid-cols-2 gap-2">
                                  {['option_a', 'option_b', 'option_c', 'option_d'].map((field) => (
                                    <input
                                      key={field}
                                      type="text"
                                      value={editQuestions[idx]?.[field] || q[field] || ''}
                                      onChange={(e) => updateEditingQuestion(difficulty.id, idx, field, e.target.value)}
                                      className="px-3 py-1 border border-gray-300 rounded text-sm"
                                      placeholder={field.replace('option_', 'Option ').toUpperCase()}
                                    />
                                  ))}
                                </div>
                                <select
                                  value={editQuestions[idx]?.correct_option || q.correct_option || 'A'}
                                  onChange={(e) => updateEditingQuestion(difficulty.id, idx, 'correct_option', e.target.value)}
                                  className="mt-2 px-3 py-1 border border-gray-300 rounded text-sm"
                                >
                                  {['A', 'B', 'C', 'D'].map(o => (
                                    <option key={o} value={o}>{o}</option>
                                  ))}
                                </select>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Manual Entry Form */}
                    {showManual && (
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Manual Question Entry</h3>
                        <form onSubmit={(e) => handleManualSubmit(difficulty.id, e)} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                            <textarea
                              value={manualFormData[difficulty.id]?.question_text || ''}
                              onChange={(e) => setManualFormData({
                                ...manualFormData,
                                [difficulty.id]: { ...manualFormData[difficulty.id], question_text: e.target.value }
                              })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows="3"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Answer Options</label>
                            <div className="space-y-2">
                              {manualFormData[difficulty.id]?.options.map((option, index) => (
                                <div key={index} className="flex items-center gap-3">
                                  <input
                                    type="radio"
                                    name={`correct_option_${difficulty.id}`}
                                    checked={option.is_correct}
                                    onChange={() => {
                                      const newOptions = manualFormData[difficulty.id].options.map((opt, i) => ({
                                        ...opt,
                                        is_correct: i === index
                                      }));
                                      setManualFormData({
                                        ...manualFormData,
                                        [difficulty.id]: { ...manualFormData[difficulty.id], options: newOptions }
                                      });
                                    }}
                                    className="w-4 h-4"
                                  />
                                  <input
                                    type="text"
                                    value={option.option_text}
                                    onChange={(e) => updateManualOption(difficulty.id, index, 'option_text', e.target.value)}
                                    placeholder={`Option ${index + 1}`}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <button
                              type="submit"
                              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                            >
                              Save Question
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowManualForm({ ...showManualForm, [difficulty.id]: false })}
                              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Existing Questions */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Existing Questions ({difficultyQuestions.length})</h3>
                      {difficultyQuestions.length > 0 ? (
                        <div className="space-y-3">
                          {difficultyQuestions.map((question) => (
                            <div key={question.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                              <div className="flex items-start justify-between mb-2">
                                <p className="text-gray-800 flex-1">{question.question_text}</p>
                                <button
                                  onClick={() => handleDeleteQuestion(question.id)}
                                  className="ml-4 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                                >
                                  Delete
                                </button>
                              </div>
                              <div className="ml-4 space-y-1">
                                {question.options?.map((option, idx) => (
                                  <div key={option.id} className={`text-sm ${option.is_correct ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                                    {String.fromCharCode(65 + idx)}. {option.option_text} {option.is_correct && '✓'}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No questions yet for this difficulty level.</p>
                      )}
                    </div>
                  </div>
                )
                }
              </div>
            );
          })}
        </div>
      </div>

      {/* Success Modal */}
      {
        showSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
              <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-green-600">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Success</h3>
              <p className="text-gray-600 mb-6">{message}</p>
              <button onClick={() => { setShowSuccess(false); setMessage(''); }} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Close</button>
            </div>
          </div>
        )
      }

      {/* Error Modal */}
      {
        showError && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
              <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-red-600">
                  <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Error</h3>
              <p className="text-gray-600 mb-6">{message}</p>
              <button onClick={() => { setShowError(false); setMessage(''); }} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300">Close</button>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default QuestionManagement;
