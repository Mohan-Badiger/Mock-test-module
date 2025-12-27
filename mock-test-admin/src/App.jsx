import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import TestManagement from './pages/TestManagement';
import QuestionManagement from './pages/QuestionManagement';
import AIGenerator from './pages/AIGenerator';
import AdminProtectedRoute from './components/AdminProtectedRoute';

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
        <Route
          path="/"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/tests"
          element={
            <AdminProtectedRoute>
              <TestManagement />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/tests/:testId/questions"
          element={
            <AdminProtectedRoute>
              <QuestionManagement />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/ai"
          element={
            <AdminProtectedRoute>
              <AIGenerator />
            </AdminProtectedRoute>
          }
        />
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
  );
}

export default App;

