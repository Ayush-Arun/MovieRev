import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ onOpenAuth }) => {
    const { user, logout, isAdmin } = useAuth();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Helper to check active state
    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* Overlay for sidebar */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Desktop Side Navbar */}
            <aside className={`h-full w-64 fixed left-0 top-0 bg-[#0e0e0e] flex-col py-8 px-6 z-50 flex border-r border-white/5 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="mb-12">
                    <h1 className="text-2xl font-black text-[#f3ffca] tracking-tighter uppercase font-headline">GLITCH_NOIR</h1>
                    <p className="font-headline uppercase tracking-[0.1em] text-[10px] text-white/40">BIOLOGICAL_TERMINAL_V1</p>
                </div>

                <nav className="flex-1 space-y-4" onClick={() => setIsSidebarOpen(false)}>
                    <Link to="/browse" className={`flex items-center gap-3 font-headline uppercase tracking-[0.1em] text-sm transition-all duration-75 ${isActive('/browse') ? 'text-[#f3ffca] border-l-2 border-[#f3ffca] pl-4' : 'text-white/40 hover:bg-[#f3ffca]/10 hover:text-[#f3ffca] pl-4'}`}>
                        <span className="material-symbols-outlined text-lg">theaters</span>
                        <span>CRITICISM</span>
                    </Link>
                    <Link to="/showtimes" className={`flex items-center gap-3 font-headline uppercase tracking-[0.1em] text-sm transition-all duration-75 ${isActive('/showtimes') ? 'text-[#f3ffca] border-l-2 border-[#f3ffca] pl-4' : 'text-white/40 hover:bg-[#f3ffca]/10 hover:text-[#f3ffca] pl-4'}`}>
                        <span className="material-symbols-outlined text-lg">new_releases</span>
                        <span>RELEASES</span>
                    </Link>
                    <Link to="/" className={`flex items-center gap-3 font-headline uppercase tracking-[0.1em] text-sm transition-all duration-75 ${isActive('/') ? 'text-[#f3ffca] border-l-2 border-[#f3ffca] pl-4' : 'text-white/40 hover:bg-[#f3ffca]/10 hover:text-[#f3ffca] pl-4'}`}>
                        <span className="material-symbols-outlined text-lg">lens_blur</span>
                        <span>THE_VOID</span>
                    </Link>
                    <Link to="/watchlist" className={`flex items-center gap-3 font-headline uppercase tracking-[0.1em] text-sm transition-all duration-75 ${isActive('/watchlist') ? 'text-[#f3ffca] border-l-2 border-[#f3ffca] pl-4' : 'text-white/40 hover:bg-[#f3ffca]/10 hover:text-[#f3ffca] pl-4'}`}>
                        <span className="material-symbols-outlined text-lg">history</span>
                        <span>ARCHIVE</span>
                    </Link>
                    <Link to="/profile" className={`flex items-center gap-3 font-headline uppercase tracking-[0.1em] text-sm transition-all duration-75 ${isActive('/profile') ? 'text-[#f3ffca] border-l-2 border-[#f3ffca] pl-4' : 'text-white/40 hover:bg-[#f3ffca]/10 hover:text-[#f3ffca] pl-4'}`}>
                        <span className="material-symbols-outlined text-lg">settings</span>
                        <span>SETTINGS</span>
                    </Link>
                    {isAdmin && (
                        <Link to="/admin" className={`flex items-center gap-3 font-headline uppercase tracking-[0.1em] text-sm transition-all duration-75 ${isActive('/admin') ? 'text-secondary border-l-2 border-secondary pl-4' : 'text-secondary/70 hover:bg-secondary/10 hover:text-secondary pl-4'}`}>
                            <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                            <span>ADMIN</span>
                        </Link>
                    )}
                </nav>
            </aside>

            {/* Top Navbar */}
            <header className="fixed top-0 w-full flex justify-between items-center px-6 md:px-10 py-4 bg-[#0e0e0e]/80 backdrop-blur-xl z-30 shadow-[0_0_20px_rgba(243,255,202,0.05)] border-b border-white/5">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => setIsSidebarOpen(true)}
                        className="text-[#f3ffca] hover:text-[#ff706f] transition-colors p-2 -ml-2"
                    >
                        <span className="material-symbols-outlined text-3xl">menu</span>
                    </button>
                    <Link to="/" className="text-3xl font-black italic text-[#f3ffca] tracking-[-0.05em] font-headline hidden sm:block">GN</Link>
                    
                    <div className="hidden lg:flex items-center gap-6">
                        <Link to="/" className="font-headline font-bold uppercase tracking-widest text-white/60 hover:skew-x-2 hover:text-[#ff706f] transition-all">SENSORS</Link>
                        <Link to="/browse" className="font-headline font-bold uppercase tracking-widest text-white/60 hover:skew-x-2 hover:text-[#ff706f] transition-all">MANIFESTO</Link>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden sm:flex items-center bg-surface-container-highest px-4 py-1.5 gap-3 border-b-2 border-primary">
                        <span className="material-symbols-outlined text-primary text-sm">search</span>
                        <input 
                            className="bg-transparent border-none focus:outline-none focus:ring-0 text-[10px] font-headline uppercase tracking-widest text-on-surface p-0 w-48" 
                            placeholder="SEARCH_TERMINAL..." 
                            type="text" 
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.target.value.trim()) {
                                    window.location.href = `/browse?search=${encodeURIComponent(e.target.value.trim())}`;
                                }
                            }}
                        />
                    </div>

                    <div className="flex items-center gap-4 text-[#f3ffca]">
                        <span className="material-symbols-outlined cursor-pointer glitch-hover transition-all">notifications_active</span>
                        <span className="material-symbols-outlined cursor-pointer glitch-hover sm:hidden transition-all">search</span>
                        
                        {user ? (
                            <div className="relative group cursor-pointer">
                                <div className="w-8 h-8 bg-surface-variant flex items-center justify-center border-outline-variant border-[1px] border-opacity-20 hover:border-primary transition-colors">
                                    <span className="material-symbols-outlined text-xs">person</span>
                                </div>
                                <div className="absolute right-0 mt-2 w-48 bg-surface-container border border-white/10 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                    <div className="p-2 flex flex-col font-headline text-xs tracking-widest uppercase">
                                        <div className="px-3 py-2 text-white/40 border-b border-white/10 mb-1">{user.displayName || user.username}</div>
                                        <Link to="/profile" className="px-3 py-2 hover:bg-white/5 hover:text-primary transition-colors">Profile</Link>
                                        <button onClick={logout} className="px-3 py-2 hover:bg-white/5 text-secondary text-left transition-colors">Logout</button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <button onClick={onOpenAuth} className="font-headline text-xs tracking-widest font-bold uppercase border border-primary px-3 py-1 hover:bg-primary hover:text-on-primary transition-all">
                                IDENTIFY
                            </button>
                        )}
                    </div>
                </div>
            </header>

        </>
    );
};

export default Navbar;
