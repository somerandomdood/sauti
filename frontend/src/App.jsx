import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home'; // <-- Imported Home here
import Auth from './pages/Auth';
import Discover from './pages/Discover';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import ScoutOnboarding from './pages/ScoutOnboarding';
import ArtistProfile from './pages/ArtistProfile';
import Chat from './pages/Chat';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('sauti_token');
  return token ? children : <Navigate to="/auth" replace />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* BASE LANDING PATH: Now loads our gorgeous custom entrance view */}
        <Route path="/" element={<Home />} />

        {/* Public Login / Register Gateway */}
        <Route path="/auth" element={<Auth />} />

        {/* Protected Scout Explorer Views */}
        <Route path="/discover" element={
          <ProtectedRoute>
            <Discover />
          </ProtectedRoute>
        } />
        
        <Route path="/artist/:id" element={
          <ProtectedRoute>
            <ArtistProfile />
          </ProtectedRoute>
        } />

        {/* Protected Live Chat Channel Room */}
        <Route path="/chat/:roomId" element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        } />

        {/* Protected Artist Dashboard Control Center */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        {/* Protected First-Time Setup Pages */}
        <Route path="/onboarding" element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        } />

        <Route path="/scout-onboarding" element={
          <ProtectedRoute>
            <ScoutOnboarding />
          </ProtectedRoute>
        } />

        {/* Automatic fallback redirect for unknown links */}
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </Router>
  );
}
