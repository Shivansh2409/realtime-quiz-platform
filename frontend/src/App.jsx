import { Routes, Route } from 'react-router-dom';
import Home from './components/Shared/Home';
import AdminDashboard from './components/Admin/AdminDashboard';
import QuizCreator from './components/Admin/QuizCreator';
import SessionHost from './components/Admin/SessionHost';
import JoinQuiz from './components/Student/JoinQuiz';
import QuizRoom from './components/Student/QuizRoom';
import Results from './components/Shared/Results';

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/create" element={<QuizCreator />} />
        <Route path="/admin/session/:sessionId" element={<SessionHost />} />
        <Route path="/join" element={<JoinQuiz />} />
        <Route path="/join/:code" element={<JoinQuiz />} />
        <Route path="/quiz/:code" element={<QuizRoom />} />
        <Route path="/results/:sessionId" element={<Results />} />
      </Routes>
    </div>
  );
}

export default App;
