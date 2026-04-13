import React, { useState } from 'react';
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
import { Watchlist, Showtimes } from './pages/Watchlist';

const AppContent = () => {
    const location = useLocation();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(Boolean(location.state?.openAuth));

    return (
        <div className="min-h-screen bg-cine-darker font-sans text-slate-200 selection:bg-cine-gold selection:text-cine-darker">
            <Navbar onOpenAuth={() => setIsAuthModalOpen(true)} />
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
            
            <main className="max-w-7xl mx-auto px-4 md:px-8 pb-12">
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
