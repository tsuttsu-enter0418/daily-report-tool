import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { lazy, Suspense } from "react";
import { Spinner, Center } from "@chakra-ui/react";
import { ProtectedRoute } from "./components/ProtectedRoute";

// 遅延読み込み（Lazy Loading）
const Login = lazy(() =>
  import("./pages/Login").then((module) => ({ default: module.Login })),
);
const Home = lazy(() =>
  import("./pages/Home").then((module) => ({ default: module.Home })),
);
const SupervisorDashboard = lazy(() =>
  import("./pages/SupervisorDashboard").then((module) => ({
    default: module.SupervisorDashboard,
  })),
);
const DailyReportForm = lazy(() =>
  import("./pages/DailyReportForm").then((module) => ({
    default: module.DailyReportForm,
  })),
);
const DailyReportList = lazy(() =>
  import("./pages/DailyReportList").then((module) => ({
    default: module.DailyReportList,
  })),
);
const DailyReportDetail = lazy(() =>
  import("./pages/DailyReportDetail").then((module) => ({
    default: module.DailyReportDetail,
  })),
);

// ローディングコンポーネント
const PageLoader = () => (
  <Center h="100vh" w="100vw">
    <Spinner size="xl" color="orange.500" />
  </Center>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
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
          <Route
            path="/report/detail/:id"
            element={
              <ProtectedRoute>
                <DailyReportDetail />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
