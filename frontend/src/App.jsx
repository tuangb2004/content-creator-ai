import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/Shared/ProtectedRoute';
import ToastWrapper from './components/Shared/ToastWrapper';

// Pages
import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import ProjectsPage from './pages/ProjectsPage';
import VerifyEmailPage from './pages/VerifyEmailPage';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                {/* Redirect old register/login routes to landing page */}
                <Route path="/register" element={<LandingPage />} />
                <Route path="/login" element={<LandingPage />} />
                {/* Email verification page */}
                <Route path="/verify-email" element={<VerifyEmailPage />} />

                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Home />
                    </ProtectedRoute>
                  }
                />
                {/* Redirect old routes to dashboard (workspace is now in LandingPage) */}
                <Route
                  path="/generate"
                  element={
                    <ProtectedRoute>
                      <Home />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/generate/text"
                  element={
                    <ProtectedRoute>
                      <Home />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/generate/image"
                  element={
                    <ProtectedRoute>
                      <Home />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tools/hashtags"
                  element={
                    <ProtectedRoute>
                      <Home />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tools/improver"
                  element={
                    <ProtectedRoute>
                      <Home />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/projects"
                  element={
                    <ProtectedRoute>
                      <ProjectsPage />
                    </ProtectedRoute>
                  }
                />
                {/* Redirect analytics and settings to dashboard */}
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <Home />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Home />
                    </ProtectedRoute>
                  }
                />
              </Routes>

              {/* Toast Notifications */}
              <ToastWrapper />
            </div>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
