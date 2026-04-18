// Profile.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);

    useEffect(() => {
        // Mock fetch stats
        setTimeout(() => setStats({ totalReviews: 5, avgRating: 8.2 }), 500);
    }, []);

    return (
        <div className="max-w-4xl mx-auto p-8 glass-panel">
            <div className="flex items-center gap-6 mb-8 border-b border-slate-700 pb-8">
                <div className="h-24 w-24 bg-cine-gold text-cine-darker rounded-full flex items-center justify-center text-4xl font-bold">
                    {user?.displayName?.[0] || user?.username?.[0] || 'U'}
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">{user?.displayName || 'User'}</h1>
                    <p className="text-slate-400">@{user?.username} • {user?.email}</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                    <h2 className="text-xl font-bold text-cine-gold mb-4">Your Stats</h2>
                    {stats ? (
                        <div className="space-y-3">
                            <p className="flex justify-between"><span>Reviews Written:</span> <span className="font-bold">{stats.totalReviews}</span></p>
                            <p className="flex justify-between"><span>Average Rating:</span> <span className="font-bold">{stats.avgRating}/10</span></p>
                        </div>
                    ) : <p>Loading stats...</p>}
                </div>
            </div>
        </div>
    );
};

export default Profile;
