import { Routes, Route } from "react-router-dom";
import Home from "./components/Shared/Home";
import AdminDashboard from "./components/Admin/AdminDashboard";
import QuizCreator from "./components/Admin/QuizCreator";
import SessionHost from "./components/Admin/SessionHost";
import JoinQuiz from "./components/Student/JoinQuiz";
import QuizRoom from "./components/Student/QuizRoom";
import Results from "./components/Shared/Results";
import ProtectedRoute from "./components/Shared/ProtectedRoute";
import Auth from "./components/Admin/Auth";

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin/login" element={<Auth />} />
        <Route path="/admin/register" element={<Auth />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/create"
          element={
            <ProtectedRoute>
              <QuizCreator />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/session/:sessionId"
          element={
            <ProtectedRoute>
              <SessionHost />
            </ProtectedRoute>
          }
        />
        <Route path="/join" element={<JoinQuiz />} />
        <Route path="/join/:code" element={<JoinQuiz />} />
        <Route path="/quiz/:code" element={<QuizRoom />} />
        <Route path="/results/:sessionId" element={<Results />} />
      </Routes>
    </div>
  );
}

export default App;
