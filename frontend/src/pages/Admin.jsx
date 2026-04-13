import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Database, Users } from 'lucide-react';

const Admin = () => {
    const [status, setStatus] = useState('');
    const [users, setUsers] = useState([]);

    useEffect(() => {
        api.get('/admin/users').then(res => setUsers(res.data)).catch(() => {});
    }, []);

    const triggerSync = async (endpoint) => {
        setStatus(`Syncing ${endpoint}...`);
        try {
            const res = await api.post(`/admin/sync/${endpoint}`);
            setStatus(res.data);
        } catch {
            setStatus('Error during sync');
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 glass-panel p-6">
                <h2 className="text-2xl font-bold text-cine-gold flex items-center gap-2 mb-6"><Database /> TMDB Sync Control</h2>
                {status && <div className="mb-4 p-4 bg-slate-800 border border-cine-gold text-cine-gold rounded-lg">{status}</div>}
                
                <div className="flex gap-4">
                    <button onClick={() => triggerSync('bollywood')} className="px-5 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition">Sync Bollywood Top 50</button>
                    <button onClick={() => triggerSync('south-indian')} className="px-5 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition">Sync South Indian</button>
                </div>
            </div>

            <div className="glass-panel p-6">
                <h2 className="text-2xl font-bold text-cine-gold flex items-center gap-2 mb-6"><Users /> Users List</h2>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {users.map(u => (
                        <div key={u.id} className="bg-slate-800/80 p-3 rounded border border-slate-700 flex justify-between items-center">
                            <div>
                                <p className="font-semibold">{u.email}</p>
                                <p className="text-xs text-slate-400">Role: {u.role}</p>
                            </div>
                        </div>
                    ))}
                    {users.length === 0 && <p className="text-slate-400">Loading users...</p>}
                </div>
            </div>
        </div>
    );
};

export default Admin;
