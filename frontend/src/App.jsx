import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import { Home, Browse } from './pages/Home';
import MovieDetail from './pages/MovieDetail';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import { Watchlist } from './pages/Watchlist';
import Showtimes from './pages/Showtimes';

const AppContent = () => {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        if (location.state?.openAuth) {
            setIsAuthModalOpen(true);
        }
    }, [location]);

    return (
        <div className="bg-background text-on-background selection:bg-secondary selection:text-on-secondary relative overflow-hidden min-h-screen">
            <div className="grain-overlay"></div>
            
            <Navbar onOpenAuth={() => setIsAuthModalOpen(true)} />
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
            
            <main className="pt-24 md:pl-64 pb-24 md:pb-12 min-h-screen relative z-10 transition-all duration-300">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/browse" element={<Browse />} />
                    <Route path="/movie/:id" element={<MovieDetail />} />
                    <Route path="/showtimes" element={<Showtimes />} />
                    <Route path="/watchlist" element={<Watchlist />} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><Admin /></ProtectedRoute>} />
                </Routes>
            </main>
        </div>
    );
};

function App() {
  return (
    <AuthProvider>
        <Router>
            <AppContent />
        </Router>
    </AuthProvider>
  )
}

export default App;
