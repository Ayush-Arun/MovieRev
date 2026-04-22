import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Profile = () => {
    const { user, logout } = useAuth();
    const [stats, setStats] = useState(null);

    useEffect(() => {
        // Mock fetch stats
        setTimeout(() => setStats({ 
            totalReviews: 5, 
            avgRating: 8.2, 
            watchlistCount: 12,
            joinDate: '2026-04-18' 
        }), 800);
    }, []);

    const handleLogout = () => {
        logout();
    };

    if (!user) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
                <span className="material-symbols-outlined text-6xl text-primary mb-4 animate-pulse">lock</span>
                <h1 className="text-2xl font-headline font-black uppercase tracking-widest text-on-surface mb-2">Access Denied</h1>
                <p className="text-white/40 font-body text-sm mb-6 uppercase tracking-widest">Authorization required to view this sector.</p>
                <Link to="/" className="px-8 py-3 bg-primary text-black font-headline font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors">Return to Base</Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Header section */}
            <div className="relative overflow-hidden bg-surface-container border border-white/10 p-8 md:p-12 flex flex-col md:flex-row items-center md:items-end gap-8 group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 group-hover:bg-primary/10 transition-colors duration-1000"></div>

                <div className="relative">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-none border-[3px] border-primary flex items-center justify-center bg-black/50 overflow-hidden relative shadow-[0_0_30px_rgba(202,253,0,0.2)]">
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0" />
                        ) : (
                            <span className="text-6xl font-headline font-black text-primary uppercase">{user.displayName?.[0] || user.username?.[0] || 'X'}</span>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-primary text-black text-[9px] font-black font-headline uppercase tracking-widest px-2 py-1">
                        LEVEL_01
                    </div>
                </div>

                <div className="flex-1 text-center md:text-left space-y-2 relative z-10 w-full">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                        <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                        <span className="text-[10px] text-primary font-headline font-bold uppercase tracking-[0.2em]">{user.role || 'OPERATIVE'} VERIFIED</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black font-headline uppercase tracking-tighter text-white">{user.displayName || user.username}</h1>
                    <div className="flex flex-col md:flex-row items-center gap-4 text-xs font-headline uppercase tracking-widest text-white/40 pt-2">
                        <span>ID: {user.username || 'UNKNOWN'}</span>
                        <span className="hidden md:inline text-white/20">•</span>
                        <span>COMMS: {user.email}</span>
                    </div>
                </div>

                <div className="flex flex-col gap-3 relative z-10 w-full md:w-auto">
                    <Link to="/settings" className="w-full md:w-auto px-8 py-3 border border-white/20 hover:border-primary text-white hover:text-primary transition-all font-headline font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 group/btn">
                        <span className="material-symbols-outlined text-[14px] group-hover/btn:rotate-90 transition-transform">settings</span> Settings
                    </Link>
                    <button onClick={handleLogout} className="w-full md:w-auto px-8 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 hover:border-red-500/50 transition-all font-headline font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[14px]">logout</span> Terminate Session
                    </button>
                </div>
            </div>

            {/* Stats section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'ARCHIVE ENTRIES', value: stats ? stats.totalReviews : '...', icon: 'library_books', suffix: ' REVIEWS' },
                    { label: 'AVERAGE CALIBRATION', value: stats ? stats.avgRating : '...', icon: 'analytics', suffix: ' / 10' },
                    { label: 'WATCHLIST TARGETS', value: stats ? stats.watchlistCount : '...', icon: 'bookmark_added', suffix: ' PENDING' }
                ].map((stat, i) => (
                    <div key={i} className="bg-surface-container border-l-4 border-l-primary border border-white/5 p-6 md:p-8 flex items-start gap-4 group hover:bg-surface-container-high transition-colors">
                        <span className="material-symbols-outlined text-3xl text-primary/40 group-hover:text-primary transition-colors">{stat.icon}</span>
                        <div>
                            <h3 className="text-[10px] font-headline font-bold uppercase tracking-[0.2em] text-white/40 mb-2">{stat.label}</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl lg:text-4xl font-black font-headline text-white">{stat.value}</span>
                                {stat.suffix && <span className="text-xs font-headline font-bold uppercase tracking-widest text-primary/70">{stat.suffix}</span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recents area skeleton */}
            <div className="border border-white/5 bg-surface-container-low p-8 relative overflow-hidden">
                <div className="absolute right-0 top-0 text-[120px] font-bold font-headline text-white/[0.02] -translate-y-1/4 select-none pointer-events-none">ACTIVITY</div>
                <div className="flex items-center gap-3 mb-8">
                    <span className="material-symbols-outlined text-primary">history</span>
                    <h2 className="text-xl font-headline font-black uppercase tracking-widest text-white">Recent Operations</h2>
                </div>
                
                {stats ? (
                    <div className="space-y-4 relative z-10">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-white/10 bg-white/5 hover:border-primary/50 transition-colors gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-surface-container-highest flex items-center justify-center">
                                        <span className="material-symbols-outlined text-white/30 text-[18px]">movie</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-headline font-bold uppercase tracking-wider text-white">CLASSIFIED_FILE_{Math.floor(Math.random()*9000)+1000}</p>
                                        <p className="text-[10px] font-headline uppercase tracking-widest text-white/40 mt-1">Status: Initialized</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-headline uppercase tracking-[0.2em] text-primary/70 bg-primary/10 px-3 py-1 self-start sm:self-auto">T-{i * 12} HOURS</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex justify-center items-center py-12">
                        <span className="w-6 h-6 border-2 border-white/10 border-t-primary rounded-full animate-spin"></span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
