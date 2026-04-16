import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';

const Showtimes = () => {
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState('Bangalore');
    const [showtimes, setShowtimes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/theatres/cities').then(res => setCities(res.data)).catch(console.error);
    }, []);

    useEffect(() => {
        setLoading(true);
        api.get(`/showtimes?city=${selectedCity}`)
            .then(res => {
                setShowtimes(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [selectedCity]);

    // Group showtimes by movie
    const groupedByMovie = showtimes.reduce((acc, st) => {
        if (!acc[st.movie_id]) {
            acc[st.movie_id] = {
                title: st.movie_title,
                poster: st.poster_url,
                theatres: {}
            };
        }
        if (!acc[st.movie_id].theatres[st.theatre_id]) {
            acc[st.movie_id].theatres[st.theatre_id] = {
                name: st.theatre_name,
                times: []
            };
        }
        acc[st.movie_id].theatres[st.theatre_id].times.push({
            id: st.id,
            time: st.show_time,
            format: st.format
        });
        return acc;
    }, {});

    return (
        <div className="max-w-7xl mx-auto px-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
                        Theatre <span className="text-secondary">Showtimes</span>
                    </h1>
                    <p className="text-slate-400 mt-1">Book tickets for your favorite movies in {selectedCity}</p>
                </div>

                <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2 rounded-lg">
                    <span className="text-slate-500 text-sm font-bold ml-2">CITY:</span>
                    <select 
                        value={selectedCity} 
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="bg-transparent text-white font-bold outline-none cursor-pointer pr-4"
                    >
                        {cities.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                        {!cities.includes('Bangalore') && <option value="Bangalore">Bangalore</option>}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
                </div>
            ) : Object.keys(groupedByMovie).length > 0 ? (
                <div className="grid grid-cols-1 gap-12">
                    {Object.values(groupedByMovie).map((movie, idx) => (
                        <div key={idx} className="bg-slate-900/50 rounded-2xl overflow-hidden border border-slate-800 flex flex-col md:flex-row">
                            <div className="w-full md:w-64 h-80 md:h-auto overflow-hidden">
                                <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover hover:scale-105 transition duration-500" />
                            </div>
                            <div className="flex-1 p-6 md:p-8 space-y-6">
                                <h2 className="text-3xl font-bold text-white">{movie.title}</h2>
                                {Object.values(movie.theatres).map((theatre, tIdx) => (
                                    <div key={tIdx} className="space-y-3">
                                        <h3 className="text-secondary font-bold text-lg flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-secondary"></span>
                                            {theatre.name}
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {theatre.times.map(t => (
                                                <button 
                                                    key={t.id}
                                                    className="bg-slate-800 border border-slate-700 hover:border-secondary hover:text-secondary text-white py-2 px-4 rounded-md transition-all font-mono text-sm group relative overflow-hidden"
                                                >
                                                    <span className="relative z-10">{t.time.substring(0, 5)}</span>
                                                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-secondary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
                    <div className="text-6xl mb-4">🎬</div>
                    <h3 className="text-2xl font-bold text-white">No shows found</h3>
                    <p className="text-slate-400 mt-2">Try selecting a different city or check back later.</p>
                </div>
            )}
        </div>
    );
};

export default Showtimes;
