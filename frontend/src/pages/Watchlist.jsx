import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export const Watchlist = () => {
    const { user } = useAuth();
    const [list, setList] = useState([]);

    useEffect(() => {
        const sessionId = localStorage.getItem('cv_session_id');
        const fetchUrl = user ? `/watchlist?userId=${user.id}` : `/watchlist?sessionId=${sessionId}`;
        api.get(fetchUrl).then(res => setList(res.data)).catch(() => {});
    }, [user]);

    const remove = async (id) => {
        await api.delete(`/watchlist/${id}`);
        setList(list.filter(x => x.id !== id));
    };

    return (
        <div className="px-2 md:px-6 py-8 max-w-7xl mx-auto space-y-12">
             <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="w-3 h-3 bg-primary animate-pulse"></span>
                        <span className="font-headline uppercase tracking-[0.3em] text-[10px] text-primary font-bold">DIRECTORY: /SYSTEM/USERS/WATCHLIST</span>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none italic font-headline text-on-surface">SAVED_ANOMALIES</h2>
                    {!user && (
                        <p className="text-secondary font-headline uppercase tracking-[0.1em] text-[10px] mt-4 border border-secondary/30 p-3 bg-secondary/5 max-w-lg">
                            GUEST_ACCESS: SIGN IN TO BIND THESE RECORDS TO YOUR PERMANENT INDEX.
                        </p>
                    )}
                </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {list.map(item => (
                    <div key={item.id} className="group bg-surface-container-low transition-all rounded-none overflow-hidden border border-white/5 hover:border-primary/30 relative">
                        <Link to={`/movie/${item.movie_id}`} className="block aspect-[2/3] overflow-hidden bg-black relative">
                            {item.poster_url ? (
                                <img src={item.poster_url} className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 transition-all duration-500" alt={item.title} />
                            ) : (
                                <div className="w-full h-full flex flex-col justify-center items-center opacity-30 text-white font-headline">
                                   <span className="material-symbols-outlined text-4xl mb-2">broken_image</span>
                                   <span className="text-[10px] tracking-widest uppercase">DATA_MISSING</span>
                                </div>
                            )}
                        </Link>
                        <div className="p-6 bg-gradient-to-t from-surface-container-lowest to-transparent border-t border-white/5">
                            <h3 className="font-headline text-lg font-bold text-white uppercase tracking-tight truncate mb-4">{item.title}</h3>
                            <button 
                                onClick={() => remove(item.id)} 
                                className="w-full text-[10px] font-headline font-black uppercase tracking-[0.2em] border border-white/10 text-white/40 hover:text-error hover:border-error transition-all py-3 hover:bg-error/5"
                            >
                                DELETE_LOG_ENTRY
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {list.length === 0 && (
                <div className="py-24 text-center border-2 border-dashed border-white/5">
                    <span className="material-symbols-outlined text-white/10 text-6xl mb-4">inventory_2</span>
                    <p className="text-white/20 font-headline uppercase tracking-[0.4em] text-xs">NO SUBJECTS RECORDED IN CURRENT SESSION.</p>
                </div>
            )}
        </div>
    );
};
