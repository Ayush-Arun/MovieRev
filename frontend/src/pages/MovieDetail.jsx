import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const MovieDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [movie, setMovie] = useState(null);
    const [cast, setCast] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [reviewForm, setReviewForm] = useState({ rating: 5, body: '', title: '' });

    useEffect(() => {
        api.get(`/movies/${id}`).then(res => setMovie(res.data)).catch(() => {});
        api.get(`/movies/${id}/cast`).then(res => setCast(res.data)).catch(() => {});
        api.get(`/movies/${id}/reviews`).then(res => setReviews(res.data)).catch(() => {});
    }, [id]);

    const submitReview = async (e) => {
        e.preventDefault();
        try {
            await api.post('/reviews', { 
                movieId: movie.id, 
                rating: reviewForm.rating, 
                reviewTitle: reviewForm.title, 
                reviewBody: reviewForm.body,
                userId: user?.id,
                sessionId: localStorage.getItem('cv_session_id') || crypto.randomUUID()
            });
            alert('Review submitted!');
            window.location.reload();
        } catch(e) {
            alert('Failed to submit: ' + (e.response?.data || e.message));
        }
    };

    if (!movie) return <div className="p-12 text-center font-headline uppercase tracking-widest text-primary animate-pulse">Loading Archive Data...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 space-y-16">
            
            {/* Header / Hero */}
            <div className="flex flex-col md:flex-row gap-12 items-start relative">
                <div className="w-full md:w-1/3 aspect-[2/3] bg-surface-container shadow-[0_0_40px_rgba(202,253,0,0.15)] relative group overflow-hidden border border-white/10">
                    {movie.poster_url ? (
                        <img src={movie.poster_url} className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 transition-all duration-700" alt={movie.title} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/30 font-headline uppercase text-xs tracking-widest"><span className="material-symbols-outlined mb-2 text-2xl block text-center">broken_image</span>DATA_MISSING</div>
                    )}
                </div>
                
                <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-3 h-3 bg-secondary animate-pulse"></span>
                        <span className="font-headline uppercase tracking-[0.3em] text-[10px] text-secondary font-bold">DIRECTORY: /SYSTEM/INDEX/{movie.original_language || 'EN'}</span>
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] font-headline text-on-surface">{movie.title}</h1>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs font-headline uppercase tracking-widest text-white/60 pt-4 border-t border-white/10">
                        <span className="text-primary font-bold flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">star</span> {movie.aggregate_rating?.toFixed(1) || 'N/A'}</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">calendar_today</span> {movie.release_date}</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">schedule</span> {movie.runtime_minutes ? `${movie.runtime_minutes} MIN` : 'UNKNOWN_DURATION'}</span>
                    </div>

                    <div className="mt-6 flex">
                        <button 
                            onClick={async () => {
                                try {
                                    let sid = localStorage.getItem('cv_session_id');
                                    if (!sid) {
                                        sid = crypto.randomUUID();
                                        localStorage.setItem('cv_session_id', sid);
                                    }
                                    await api.post('/watchlist', {
                                        movieId: movie.id,
                                        userId: user?.id,
                                        sessionId: sid
                                    });
                                    alert('Successfully added to your Archive.');
                                } catch (e) {
                                    alert('Failed to add to Archive.');
                                }
                            }}
                            className="flex items-center gap-2 bg-transparent border border-secondary text-secondary hover:bg-secondary hover:text-on-secondary px-6 py-3 font-headline uppercase tracking-widest text-xs transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm">bookmark_add</span>
                            ADD_TO_ARCHIVE
                        </button>
                    </div>

                    <div className="mt-8 pt-8">
                        <h3 className="font-headline uppercase tracking-[0.2em] text-xs text-primary mb-4">[SYNOPSIS_DECRYPTED]</h3>
                        <p className="text-white/80 font-body text-lg leading-relaxed max-w-2xl">{movie.synopsis || "No data recovered."}</p>
                    </div>
                </div>
            </div>

            {/* Cast Section */}
            <div className="border-t-2 border-primary pt-8">
                <div className="flex items-end justify-between mb-8 pb-2">
                    <h2 className="text-2xl md:text-3xl font-black text-on-surface uppercase tracking-tight font-headline">BIOLOGICAL_ENTITIES / CAST</h2>
                    <span className="font-headline uppercase tracking-widest text-[8px] text-white/40">STATUS: VERIFIED</span>
                </div>
                
                {cast.length === 0 ? <p className="text-white/40 font-headline uppercase tracking-widest text-xs">NO SUBJECTS FOUND.</p> : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {cast.map(c => (
                            <div key={c.id} className="bg-surface-container-low p-4 group border border-transparent hover:border-secondary transition-colors">
                                <div className="aspect-square bg-surface-container-highest mb-4 overflow-hidden rounded-full border-2 border-transparent group-hover:border-secondary transition-colors w-24 h-24 mx-auto">
                                    {c.profile_photo_url ? (
                                        <img src={c.profile_photo_url} className="w-full h-full object-cover grayscale contrast-125" alt={c.name} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center material-symbols-outlined text-white/30 text-3xl">person</div>
                                    )}
                                </div>
                                <div className="text-center">
                                    <p className="font-headline uppercase text-white font-bold text-xs tracking-wider mb-1 truncate">{c.name}</p>
                                    <p className="font-headline uppercase text-secondary text-[9px] tracking-widest truncate">{c.character_name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Reviews Section */}
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-12 border-t border-white/10 pt-16">
                <div className="space-y-6">
                    <h3 className="font-headline uppercase tracking-[0.2em] text-sm text-on-surface border-l-2 border-primary pl-4 mb-8">System User Logs (Reviews)</h3>
                    {reviews.length === 0 ? <p className="text-white/40 font-headline text-xs tracking-widest uppercase">No logs recorded. Initialize sequence.</p> : null}
                    
                    <div className="space-y-4">
                        {reviews.map(r => (
                            <div key={r.id} className="bg-surface-container-lowest p-6 border border-white/5 hover:border-primary/50 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="font-bold text-white font-headline tracking-wide uppercase text-sm">{r.review_title}</h4>
                                        <p className="text-[10px] text-white/40 font-headline tracking-widest mt-1 uppercase">ID: {r.user_id ? r.user_id : 'GUEST_ENTITY'}</p>
                                    </div>
                                    <span className="font-headline text-xl text-primary font-bold">{r.rating}<span className="text-xs text-white/30">/10</span></span>
                                </div>
                                <p className="text-white/70 font-body text-sm leading-relaxed">{r.review_body}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-surface-container-low p-8 border border-white/10 sticky top-24 self-start">
                    <h3 className="text-lg font-bold text-primary mb-6 font-headline uppercase tracking-widest">Input Analysis</h3>
                    {!user && <div className="mb-6 p-4 bg-surface-container border border-secondary/50 text-xs text-secondary font-headline uppercase tracking-widest leading-relaxed">Guest Access Detected. Login to bind logs to your permanent index.</div>}
                    
                    <form onSubmit={submitReview} className="flex flex-col gap-6">
                        <div>
                            <div className="flex justify-between font-headline text-xs text-white/60 uppercase tracking-widest mb-3">
                                <span>Rating_Value</span>
                                <span className="text-primary font-bold">{reviewForm.rating}</span>
                            </div>
                            <input type="range" min="1" max="10" value={reviewForm.rating} onChange={e => setReviewForm({...reviewForm, rating: parseInt(e.target.value)})} className="w-full accent-primary" />
                        </div>
                        <input type="text" placeholder="SUBJECT_LINE..." required className="bg-surface-container border-b border-white/20 focus:border-primary transition-colors rounded-none p-3 w-full outline-none text-white font-headline text-sm uppercase tracking-wider placeholder-white/30" value={reviewForm.title} onChange={e => setReviewForm({...reviewForm, title: e.target.value})} />
                        <textarea placeholder="LOG_OBSERVATION..." required rows="4" className="bg-surface-container border border-white/10 focus:border-primary transition-colors rounded-none p-3 w-full outline-none text-white font-body text-sm placeholder-white/30" value={reviewForm.body} onChange={e => setReviewForm({...reviewForm, body: e.target.value})} />
                        <button type="submit" className="bg-primary text-black font-black font-headline uppercase tracking-widest py-4 hover:bg-secondary transition-colors text-sm">Execute Transmission</button>
                    </form>
                </div>
            </div>
            
        </div>
    );
};

export default MovieDetail;
