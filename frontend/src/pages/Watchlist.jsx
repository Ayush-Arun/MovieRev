import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export const Watchlist = () => {
    const { user } = useAuth();
    const [list, setList] = useState([]);

    useEffect(() => {
        const fetchUrl = user ? `/watchlist?userId=${user.id}` : `/watchlist?sessionId=${localStorage.getItem('cv_session_id')}`;
        api.get(fetchUrl).then(res => setList(res.data)).catch(() => {});
    }, [user]);

    const remove = async (id) => {
        await api.delete(`/watchlist/${id}`);
        setList(list.filter(x => x.id !== id));
    };

    return (
        <div className="max-w-7xl mx-auto px-6 space-y-6">
            <h1 className="text-3xl font-bold border-l-4 border-cine-gold pl-3">Your Watchlist</h1>
            {!user && <div className="p-4 bg-slate-800 border border-cine-gold text-cine-gold rounded">Sign in to save your watchlist permanently across devices!</div>}
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
                {list.map(item => (
                    <div key={item.id} className="relative group rounded-lg overflow-hidden border border-slate-700 bg-slate-800">
                        <Link to={`/movie/${item.movie_id}`}>
                            <div className="aspect-[2/3]">{item.poster_url && <img src={item.poster_url} className="w-full h-full object-cover" />}</div>
                        </Link>
                        <div className="p-3">
                            <h3 className="font-bold truncate">{item.title}</h3>
                            <button onClick={() => remove(item.id)} className="mt-2 w-full text-sm bg-rose-500/20 text-rose-400 hover:bg-rose-500/40 p-2 rounded transition">Remove</button>
                        </div>
                    </div>
                ))}
                {list.length === 0 && <p className="text-slate-400 col-span-full">Your watchlist is currently empty.</p>}
            </div>
        </div>
    );
};
