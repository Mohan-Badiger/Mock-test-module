import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import ViewAll from './pages/ViewAll';
import DifficultySelection from './pages/DifficultySelection';
import PreparingAssessment from './pages/PreparingAssessment';
import TestStart from './pages/TestStart';
import ExamInterface from './pages/ExamInterface';
import Results from './pages/Results';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/view-all" element={<ViewAll />} />
          <Route path="/test/:testId/difficulty" element={<ProtectedRoute><DifficultySelection /></ProtectedRoute>} />
          <Route path="/test/:testId/preparing" element={<ProtectedRoute><PreparingAssessment /></ProtectedRoute>} />
          <Route path="/test/:testId/start" element={<ProtectedRoute><TestStart /></ProtectedRoute>} />
          <Route path="/test/:testId/exam/:attemptId" element={<ProtectedRoute><ExamInterface /></ProtectedRoute>} />
          <Route path="/test/:testId/results/:attemptId" element={<ProtectedRoute><Results /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </Router>
    </AuthProvider>
  );
}

export default App;

