import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setContext } from '../features/testSlice';
import { toast } from 'react-toastify';
import { adminAPI } from '../utils/api';
import AdminProfile from '../components/AdminProfile';

const AIGenerator = () => {
  const dispatch = useDispatch();
  const { companyName: savedCompanyName, rolePosition: savedRolePosition } = useSelector((state) => state.tests);

  const [topic, setTopic] = useState('Computer Fundamentals');
  const [companyName, setCompanyName] = useState(savedCompanyName || '');
  const [rolePosition, setRolePosition] = useState(savedRolePosition || '');
  const [difficultyLevel, setDifficultyLevel] = useState('3');
  const [description, setDescription] = useState(''); // New state for description
  const [count, setCount] = useState(30); // New state for question count
  const [aiProvider, setAiProvider] = useState('openai'); // New state for AI provider
  const [generated, setGenerated] = useState([]);
  const [editing, setEditing] = useState({});
  const [loading, setLoading] = useState(false);
  const [tests, setTests] = useState([]);
  const [difficulties, setDifficulties] = useState([]);
  const [selectedTest, setSelectedTest] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
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

    // load tests and difficulties for approval
    const load = async () => {
      try {
        const [testsRes, diffRes] = await Promise.all([
          adminAPI.getAllTests(1, 1000),
          adminAPI.getDifficulties()
        ]);

        const testsData = testsRes.data?.tests || [];
        const difficultiesData = diffRes.data || [];

        setTests(testsData);
        setDifficulties(difficultiesData);
      } catch (e) {
        // ignore
      }
    };
    load();
    load();
  }, []);

  // Update Redux context when inputs change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      dispatch(setContext({ companyName, rolePosition }));
    }, 500); // Debounce updates
    return () => clearTimeout(timeoutId);
  }, [companyName, rolePosition, dispatch]);

  const handleGenerate = async () => {
    if (!companyName) {
      toast.error('Company Name is required');
      return;
    }
    if (!rolePosition) {
      toast.error('Role/Position is required');
      return;
    }

    setLoading(true);
    toast.info('This process will take a few minutes. Please wait...', { autoClose: 5000 });
    // setMessage(''); // Removed as setMessage is not defined in this component
    try {
      const res = await adminAPI.aiGeneratePreview({
        topic,
        company_name: companyName,
        role_position: rolePosition,
        difficulty_level: parseInt(difficultyLevel),
        topic,
        company_name: companyName,
        role_position: rolePosition,
        difficulty_level: parseInt(difficultyLevel),
        ai_provider: aiProvider,
        description,
        count: parseInt(count)
      });
      // Allow editing on client
      const questions = Array.isArray(res.data.questions) ? res.data.questions : [];
      setGenerated(questions);
      const initial = {};
      questions.forEach((q, i) => (initial[i] = q));
      setEditing(initial);
      toast.success(`Successfully generated ${questions.length} questions!`);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to generate questions');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (idx, field, value) => {
    setEditing(prev => ({ ...prev, [idx]: { ...prev[idx], [field]: value } }));
  };

  const handleApprove = async () => {
    if (!selectedTest || !selectedDifficulty) {
      toast.warning('Please select both test and difficulty before approving');
      return;
    }
    setLoading(true);
    try {
      // Send topic with chosen test/difficulty. Backend uses stored preview rows by topic
      const res = await adminAPI.aiApprove({
        topic,
        test_id: parseInt(selectedTest),
        difficulty_id: parseInt(selectedDifficulty)
      });
      toast.success(`${res.data.message} - ${res.data.count} questions saved!`);
      // Optionally clear preview list
      setGenerated([]);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to approve questions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <AdminProfile admin={admin} onAdminUpdate={setAdmin} />
      <div className="bg-white border-b border-gray-200 px-6 py-4 pr-20 sm:pr-6">
        <h1 className="text-2xl font-bold text-gray-800">AI Question Generator</h1>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">AI Generation Parameters</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Google, Microsoft, Amazon"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role/Position <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={rolePosition}
                onChange={(e) => setRolePosition(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Software Engineer, Data Scientist"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Topic/Subject</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Data Structures, Networking"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty Level (1-5)</label>
              <select
                value={difficultyLevel}
                onChange={(e) => setDifficultyLevel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1">1 - Novice</option>
                <option value="2">2 - Easy</option>
                <option value="3">3 - Intermediate</option>
                <option value="4">4 - Master</option>
                <option value="5">5 - Expert</option>
              </select>
            </div>
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description / Context (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Focus on array manipulation, time complexity, and edge cases."
                rows="2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Questions</label>
              <input
                type="number"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="50"
              />
            </div>
          </div>

          {/* AI Provider Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">Select AI Provider <span className="text-red-500">*</span></label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="aiProvider"
                  value="openai"
                  checked={aiProvider === 'openai'}
                  onChange={(e) => setAiProvider(e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="flex items-center gap-2 text-sm font-medium text-gray-700 group-hover:text-blue-600">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
                  </svg>
                  OpenAI (GPT-4)
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="aiProvider"
                  value="grok"
                  checked={aiProvider === 'grok'}
                  onChange={(e) => setAiProvider(e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="flex items-center gap-2 text-sm font-medium text-gray-700 group-hover:text-blue-600">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Grok (X.AI)
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="aiProvider"
                  value="gemini"
                  checked={aiProvider === 'gemini'}
                  onChange={(e) => setAiProvider(e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="flex items-center gap-2 text-sm font-medium text-gray-700 group-hover:text-blue-600">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-18c-4.411 0-8 3.589-8 8s3.589 8 8 8 8-3.589 8-8-3.589-8-8-8z" />
                  </svg>
                  Google Gemini
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="aiProvider"
                  value="claude"
                  checked={aiProvider === 'claude'}
                  onChange={(e) => setAiProvider(e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="flex items-center gap-2 text-sm font-medium text-gray-700 group-hover:text-blue-600">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                  Claude (Anthropic)
                </span>
              </label>
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Save to Database</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Test</label>
                <select
                  value={selectedTest}
                  onChange={(e) => setSelectedTest(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Test</option>
                  {tests.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty (Database)</label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Difficulty</option>
                  {difficulties.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={handleGenerate}
              disabled={loading || !topic}
              className={`px-6 py-2 rounded-lg font-medium text-white ${loading ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700'}`}
            >
              {loading ? 'Generating...' : `Generate ${count} Questions`}
            </button>
            <button
              onClick={handleApprove}
              disabled={loading || !generated.length || !selectedTest || !selectedDifficulty}
              className={`px-6 py-2 rounded-lg font-medium text-white ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {loading ? 'Saving...' : 'Approve & Save to DB'}
            </button>
          </div>

        </div>

        {/* Preview list */}
        {generated.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Preview & Edit</h2>
            <div className="space-y-6">
              {generated.map((q, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Question {idx + 1}</label>
                      <textarea
                        value={editing[idx]?.question_text || ''}
                        onChange={(e) => updateField(idx, 'question_text', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="2"
                      />
                    </div>
                    {['option_a', 'option_b', 'option_c', 'option_d'].map((field) => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{field.replace('option_', 'Option ').toUpperCase()}</label>
                        <input
                          type="text"
                          value={editing[idx]?.[field] || ''}
                          onChange={(e) => updateField(idx, field, e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    ))}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Correct Option</label>
                      <select
                        value={editing[idx]?.correct_option || 'A'}
                        onChange={(e) => updateField(idx, 'correct_option', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {['A', 'B', 'C', 'D'].map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIGenerator;


