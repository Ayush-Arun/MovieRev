import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, deleteAccount } = useAuth();
    const [stats, setStats] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [updateStatus, setUpdateStatus] = useState(null);
    const [retroMode, setRetroMode] = useState(localStorage.getItem('retro_mode') === 'true');
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) return;
        // Fetch real stats
        const params = new URLSearchParams({ userId: user.id });
        api.get(`/reviews/stats?${params.toString()}`)
            .then(res => setStats(res.data))
            .catch(() => setStats({ totalReviews: 0, avgRating: 0 }));
    }, [user]);

    useEffect(() => {
        if (retroMode) document.documentElement.classList.add('retro-scanlines');
        else document.documentElement.classList.remove('retro-scanlines');
    }, [retroMode]);

    const handleToggleRetro = () => {
        const newVal = !retroMode;
        setRetroMode(newVal);
        localStorage.setItem('retro_mode', newVal);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUpdateStatus('updating...');
        try {
            await api.put('/auth/profile', { displayName });
            setUpdateStatus('success');
            setTimeout(() => setUpdateStatus(null), 3000);
            window.location.reload(); // Quick refresh to update context
        } catch (err) {
            setUpdateStatus('error');
            setTimeout(() => setUpdateStatus(null), 3000);
        }
    };

    if (!user) {
        return (
            <div className="max-w-4xl mx-auto p-8 flex items-center justify-center min-h-[60vh]">
                <p className="font-headline tracking-widest uppercase text-white/50 text-xl animate-pulse">Session Terminated. Please Authenticate.</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-8 mb-12 border-b border-slate-700/50 pb-12">
                <div className="h-32 w-32 bg-primary text-black rounded-full flex items-center justify-center text-5xl font-black shadow-[0_0_30px_rgba(202,253,0,0.2)]">
                    {user?.displayName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter font-headline mb-2">{user?.displayName || 'User'}</h1>
                    <p className="text-white/40 font-headline tracking-widest text-sm uppercase">@{user?.username} // {user?.email}</p>
                </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-12">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 space-y-2">
                    <button 
                        onClick={() => setActiveTab('overview')}
                        className={`w-full text-left px-6 py-4 font-headline tracking-widest uppercase transition-all border-l-2 ${activeTab === 'overview' ? 'border-primary text-primary bg-primary/10' : 'border-transparent text-white/40 hover:bg-white/5 hover:text-white'}`}
                    >
                        Overview
                    </button>
                    <button 
                        onClick={() => setActiveTab('settings')}
                        className={`w-full text-left px-6 py-4 font-headline tracking-widest uppercase transition-all border-l-2 ${activeTab === 'settings' ? 'border-primary text-primary bg-primary/10' : 'border-transparent text-white/40 hover:bg-white/5 hover:text-white'}`}
                    >
                        Settings
                    </button>
                    <button 
                        onClick={() => setActiveTab('danger')}
                        className={`w-full text-left px-6 py-4 font-headline tracking-widest uppercase transition-all border-l-2 ${activeTab === 'danger' ? 'border-red-500 text-red-500 bg-red-500/10' : 'border-transparent text-red-500/50 hover:bg-red-500/5 hover:text-red-500'}`}
                    >
                        Danger Zone
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    {activeTab === 'overview' && (
                        <div className="space-y-8 animate-fade-in">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight font-headline">Intelligence Ledger</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-surface-container border border-white/10 p-8 hover:border-primary/30 transition-colors">
                                    <p className="text-white/40 font-headline text-xs tracking-widest uppercase mb-4 text-center">Reviews Logged</p>
                                    {stats ? (
                                        <p className="text-6xl font-black text-primary text-center font-headline">{stats.totalReviews}</p>
                                    ) : (
                                        <p className="text-2xl text-center text-white/20 animate-pulse">...</p>
                                    )}
                                </div>
                                <div className="bg-surface-container border border-white/10 p-8 hover:border-primary/30 transition-colors">
                                    <p className="text-white/40 font-headline text-xs tracking-widest uppercase mb-4 text-center">Average Rating</p>
                                    {stats ? (
                                        <p className="text-6xl font-black text-primary text-center font-headline">{stats.avgRating.toFixed(1)}</p>
                                    ) : (
                                        <p className="text-2xl text-center text-white/20 animate-pulse">...</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="space-y-8 animate-fade-in">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight font-headline">User Settings</h2>
                            <div className="bg-surface-container border border-white/10 p-8">
                                <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-md">
                                    <div>
                                        <label className="block text-white/40 font-headline text-xs tracking-widest uppercase mb-2">Display Name</label>
                                        <input 
                                            type="text" 
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 focus:border-primary p-4 text-white font-body rounded-sm outline-none transition-colors"
                                            placeholder="Enter your alias"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-white/40 font-headline text-xs tracking-widest uppercase mb-2">Email (Static)</label>
                                        <input 
                                            type="email" 
                                            value={user.email}
                                            disabled
                                            className="w-full bg-black/40 border border-white/5 p-4 text-white/50 font-body rounded-sm cursor-not-allowed"
                                        />
                                    </div>
                                    <div className="pt-4 flex items-center gap-4">
                                        <button 
                                            type="submit"
                                            className="bg-primary hover:bg-primary/90 text-black font-headline font-bold text-sm tracking-widest uppercase px-8 py-4 transition-all hover:scale-105 active:scale-95"
                                        >
                                            Save Changes
                                        </button>
                                        {updateStatus === 'updating...' && <span className="text-white/50 text-sm font-headline uppercase animate-pulse">Processing...</span>}
                                        {updateStatus === 'success' && <span className="text-green-500 text-sm font-headline uppercase tracking-widest">Done</span>}
                                        {updateStatus === 'error' && <span className="text-red-500 text-sm font-headline uppercase tracking-widest">Error</span>}
                                    </div>
                                    <p className="text-white/30 text-xs mt-4">Note: If you need to change your password, sign out and use the "Forgot Password" feature on the login terminal.</p>
                                </form>
                            </div>
                            
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight font-headline pt-8">Visual Preferences</h2>
                            <div className="bg-surface-container border border-white/10 p-8">
                                <div className="flex items-center justify-between max-w-md">
                                    <div>
                                        <h3 className="text-white font-headline tracking-widest text-sm uppercase mb-1">Retro Interface Overlay</h3>
                                        <p className="text-white/40 text-xs tracking-wide">Activates experimental CRT scanlines system-wide.</p>
                                    </div>
                                    <button 
                                        onClick={handleToggleRetro}
                                        className={`w-14 h-8 rounded-full transition-colors relative flex items-center ${retroMode ? 'bg-primary' : 'bg-white/10'}`}
                                    >
                                        <span className={`w-6 h-6 bg-black rounded-full absolute transition-all ${retroMode ? 'translate-x-7' : 'translate-x-1'}`}></span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'danger' && (
                        <div className="space-y-8 animate-fade-in">
                            <h2 className="text-2xl font-black text-red-500 uppercase tracking-tight font-headline">Danger Zone</h2>
                            <div className="bg-red-500/10 border border-red-500/30 p-8">
                                <h3 className="text-white font-bold mb-2">Delete Account</h3>
                                <p className="text-sm text-red-400/80 mb-8 max-w-lg">Permanently remove your identity, reviews, and tracking data from the network. This action cannot be reversed. All logged intelligence will be purged.</p>
                                
                                <button 
                                    onClick={() => {
                                        if (window.confirm("CRITICAL WARNING: Are you absolutely sure you want to permanently delete your account? All your reviews and data will be wiped.")) {
                                            deleteAccount().then(() => navigate('/'));
                                        }
                                    }}
                                    className="bg-red-500 hover:bg-red-600 text-white font-headline text-sm font-bold px-8 py-4 uppercase tracking-widest transition-colors shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)]"
                                >
                                    Initiate Deletion
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
