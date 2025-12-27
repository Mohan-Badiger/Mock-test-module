import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testAPI } from '../utils/api';
import DifficultyCard from '../components/DifficultyCard';
import Profile from '../components/Profile';
import DifficultySkeleton from '../components/DifficultySkeleton';

const DifficultySelection = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [difficulties, setDifficulties] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [difficultiesRes, testRes] = await Promise.all([
          testAPI.getDifficulties(),
          testAPI.getById(testId)
        ]);
        setDifficulties(difficultiesRes.data);
        setTest(testRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [testId]);

  const handleNext = () => {
    if (selectedDifficulty) {
      navigate(`/test/${testId}/preparing?difficulty=${selectedDifficulty.id}`);
    }
  };

  if (loading) {
    return (
      <>
        <Profile />
        <DifficultySkeleton />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center relative">
      <Profile />
      
      <div className="w-full max-w-5xl px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-8 sm:mb-12">
          Select difficulty level
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {difficulties.map((difficulty) => (
            <DifficultyCard
              key={difficulty.id}
              difficulty={difficulty}
              selected={selectedDifficulty?.id === difficulty.id}
              onClick={() => setSelectedDifficulty(difficulty)}
            />
          ))}
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleNext}
            disabled={!selectedDifficulty}
            className={`px-8 py-3 rounded-lg font-medium transition-colors ${
              selectedDifficulty
                ? 'bg-gray-700 text-white hover:bg-gray-800'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default DifficultySelection;

