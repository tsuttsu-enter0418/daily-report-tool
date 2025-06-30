import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/Login";
import { Home } from "./pages/Home";
import { SupervisorDashboard } from "./pages/SupervisorDashboard";
import { DailyReportForm } from "./pages/DailyReportForm";
import { DailyReportList } from "./pages/DailyReportList";
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor"
          element={
            <ProtectedRoute>
              <SupervisorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report/list"
          element={
            <ProtectedRoute>
              <DailyReportList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report/create"
          element={
            <ProtectedRoute>
              <DailyReportForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report/edit/:id"
          element={
            <ProtectedRoute>
              <DailyReportForm isEditMode />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
