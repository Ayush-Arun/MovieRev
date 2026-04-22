import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';

const TrailerModal = ({ isOpen, onClose, videoUrl }) => {
    const { isOpen: sidebarOpen } = useSidebar();
    const iframeRef = useRef(null);

    // Pause YouTube when sidebar opens
    useEffect(() => {
        if (sidebarOpen && iframeRef.current) {
            try {
                iframeRef.current.contentWindow.postMessage(
                    JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
                    '*'
                );
            } catch (e) {}
        }
    }, [sidebarOpen]);

    if (!isOpen) return null;

    const videoId = videoUrl?.split('v=')[1]?.split('&')[0];
    // enablejsapi=1 is required for postMessage control
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-10" onClick={onClose}>
            <div className="relative w-full max-w-6xl aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-primary transition-colors hover:scale-110 active:scale-95"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>
                <iframe
                    ref={iframeRef}
                    src={embedUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                />
            </div>
        </div>
    );
};

const MovieDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [movie, setMovie] = useState(null);
    const [cast, setCast] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [isTrailerOpen, setIsTrailerOpen] = useState(false);
    const [isInWatchlist, setIsInWatchlist] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, body: '', title: '' });

    useEffect(() => {
        api.get(`/movies/${id}`).then(res => setMovie(res.data)).catch(() => {});
        api.get(`/movies/${id}/cast`).then(res => setCast(res.data)).catch(() => {});
        api.get(`/movies/${id}/reviews`).then(res => setReviews(res.data)).catch(() => {});
        
        // Check watchlist status – always pass sessionId so backend can catch stale guest entries
        const sessionId = localStorage.getItem('cv_session_id') || crypto.randomUUID();
        if (!localStorage.getItem('cv_session_id')) localStorage.setItem('cv_session_id', sessionId);
        
        let checkUrl = `/watchlist/check?movieId=${id}&sessionId=${sessionId}`;
        if (user) checkUrl += `&userId=${user.id}`;
            
        api.get(checkUrl).then(res => setIsInWatchlist(res.data)).catch(() => {});
    }, [id, user]);

    const toggleWatchlist = async () => {
        try {
            const sessionId = localStorage.getItem('cv_session_id');
            if (isInWatchlist) {
                // Try removing by userId first, fall back to sessionId
                const fetchUrl = user ? `/watchlist?userId=${user.id}` : `/watchlist?sessionId=${sessionId}`;
                const res = await api.get(fetchUrl);
                const item = res.data.find(x => parseInt(x.movie_id) === parseInt(id));
                // If not found by user, try by session (stale guest entry)
                if (!item && user) {
                    const sessRes = await api.get(`/watchlist?sessionId=${sessionId}`);
                    const sessItem = sessRes.data.find(x => parseInt(x.movie_id) === parseInt(id));
                    if (sessItem) await api.delete(`/watchlist/${sessItem.id}`);
                } else if (item) {
                    await api.delete(`/watchlist/${item.id}`);
                }
                setIsInWatchlist(false);
            } else {
                await api.post('/watchlist', {
                    movieId: parseInt(id),
                    userId: user?.id || null,
                    sessionId: sessionId
                });
                setIsInWatchlist(true);
            }
        } catch (e) {
            console.error("Watchlist error", e);
        }
    };

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
                    
                    {movie.genres && Array.isArray(movie.genres) && movie.genres.length > 0 && (
                        <div className="flex flex-wrap gap-3 mt-6 mb-2">
                            {movie.genres.map((g) => (
                                <span key={g.id || g.name || g} className="text-[10px] bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 uppercase tracking-[0.2em] font-headline font-bold">
                                    {g.name || g}
                                </span>
                            ))}
                        </div>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs font-headline uppercase tracking-widest text-white/60 pt-4 border-t border-white/10">
                        {movie.ageCertificate && (
                            <span className={`px-2.5 py-1 border rounded-sm font-black ${
                                movie.ageCertificate === 'A' || movie.ageCertificate === 'R' ? 'border-red-500 text-red-500' :
                                movie.ageCertificate === 'UA' || movie.ageCertificate === 'PG-13' ? 'border-amber-500 text-amber-500' :
                                'border-green-500 text-green-500'
                            }`}>
                                {movie.ageCertificate}
                            </span>
                        )}
                        <span className="text-primary font-bold flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">star</span> {(movie.aggregateRating || movie.aggregate_rating || 0).toFixed(1)}</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">calendar_today</span> {movie.releaseDate || movie.release_date || 'N/A'}</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">schedule</span> {(movie.runtimeMinutes || movie.runtime_minutes) ? `${movie.runtimeMinutes || movie.runtime_minutes} MIN` : 'UNKNOWN_DURATION'}</span>
                    </div>

                    <div className="mt-8 flex flex-wrap gap-4">
                        { (movie.trailerUrl || movie.trailer_url) && (
                            <button 
                                onClick={() => setIsTrailerOpen(true)}
                                className="px-8 py-3 bg-primary text-black font-headline font-bold uppercase tracking-widest text-sm flex items-center gap-2 hover:bg-white transition-all hover:scale-105 active:scale-95 rounded-none"
                            >
                                <span className="material-symbols-outlined">play_circle</span> Watch Trailer
                            </button>
                        )}
                        <button 
                            onClick={toggleWatchlist}
                            disabled={isInWatchlist}
                            className={`px-8 py-3 border-2 font-headline font-bold uppercase tracking-widest text-sm flex items-center gap-2 transition-all rounded-none ${
                                isInWatchlist 
                                    ? 'border-secondary/50 text-secondary/50 cursor-not-allowed' 
                                    : 'border-white/20 text-white hover:border-primary hover:text-primary hover:scale-105 active:scale-95'
                            }`}
                        >
                            <span className="material-symbols-outlined">{isInWatchlist ? 'bookmark_added' : 'bookmark_add'}</span> 
                            {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                        </button>
                    </div>

                    {(movie.ottPlatforms || movie.ott_platforms) && (movie.ottPlatforms || movie.ott_platforms).length > 0 && (
                        <div className="mt-8 p-5 bg-white/5 border border-white/10 border-l-4 border-l-primary max-w-xl">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined text-primary text-[16px]">play_circle</span>
                                <h4 className="text-[10px] font-headline uppercase tracking-widest text-primary">Streaming On</h4>
                            </div>
                            <div className="flex flex-wrap gap-5 items-start">
                                {(movie.ottPlatforms || movie.ott_platforms).map(platform => {
                                    const pName = platform.name?.toLowerCase() || '';
                                    const titleEncoded = encodeURIComponent(movie.title);
                                    let redirectUrl = `https://google.com/search?q=${encodeURIComponent(movie.title + ' watch on ' + platform.name)}`;
                                    if (pName.includes('netflix')) redirectUrl = `https://www.netflix.com/search?q=${titleEncoded}`;
                                    else if (pName.includes('prime') || pName.includes('amazon')) redirectUrl = `https://www.primevideo.com/search/ref=atv_sr_sug_1?phrase=${titleEncoded}`;
                                    else if (pName.includes('hotstar') || pName.includes('disney')) redirectUrl = `https://www.hotstar.com/in/search?q=${titleEncoded}`;
                                    else if (pName.includes('jio')) redirectUrl = `https://www.jiocinema.com/search?query=${titleEncoded}`;
                                    else if (pName.includes('hulu')) redirectUrl = `https://www.hulu.com/search?q=${titleEncoded}`;
                                    else if (pName.includes('apple')) redirectUrl = `https://tv.apple.com/search?q=${titleEncoded}`;
                                    else if (pName.includes('zee5')) redirectUrl = `https://www.zee5.com/search?q=${titleEncoded}`;
                                    else if (pName.includes('sonyliv') || pName.includes('sony')) redirectUrl = `https://www.sonyliv.com/search?q=${titleEncoded}`;
                                    else if (pName.includes('mubi')) redirectUrl = `https://mubi.com/search?query=${titleEncoded}`;

                                    const logoSrc = platform.logoUrl || platform.logo_url || null;

                                    return (
                                        <a 
                                            href={redirectUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            key={platform.id || platform.tmdb_provider_id || pName} 
                                            className="flex flex-col items-center gap-2 group w-16"
                                            title={`Watch on ${platform.name}`}
                                        >
                                            {logoSrc ? (
                                                <img 
                                                    src={logoSrc}
                                                    alt={platform.name} 
                                                    className="w-12 h-12 rounded-xl group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(202,253,0,0.4)] transition-all shadow-lg cursor-pointer object-contain bg-white/5 flex-shrink-0"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}
                                            <div 
                                                className="w-12 h-12 rounded-xl bg-white/10 items-center justify-center text-white/60 text-[9px] font-headline uppercase text-center p-1 leading-tight cursor-pointer group-hover:bg-primary/20 transition-colors flex-shrink-0"
                                                style={{ display: logoSrc ? 'none' : 'flex' }}
                                            >
                                                {platform.name?.substring(0, 6)}
                                            </div>
                                            <span className="text-[8px] text-white/40 uppercase font-headline tracking-wider group-hover:text-primary transition-colors text-center w-full leading-tight">{platform.name}</span>
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="mt-8 pt-8">
                        <h3 className="font-headline uppercase tracking-[0.2em] text-xs text-primary mb-4">[SYNOPSIS_DECRYPTED]</h3>
                        <p className="text-white/80 font-body text-lg leading-relaxed max-w-2xl">{movie.synopsis || movie.overview || "No data recovered."}</p>
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
                                    <p className="font-headline uppercase text-white font-bold text-xs tracking-wider mb-1 truncate">{c.person_name || c.name}</p>
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
                        {reviews.map((review, i) => {
                        const rating = review.rating || 0;
                        const ratingColor = rating >= 8 ? 'text-green-400' : rating >= 6 ? 'text-amber-400' : 'text-red-400';
                        const sentiment = rating >= 8 ? 'POSITIVE' : rating >= 6 ? 'NEUTRAL' : 'NEGATIVE';
                        const rawDate = review.created_at || review.createdAt;
                        const displayDate = rawDate
                            ? new Date(rawDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                            : 'UNKNOWN';
                        const authorName = (review.review_title || review.reviewTitle || '').replace('Review by ', '') || 'VERIFIED_AUDIENCE';
                        return (
                            <div key={review.id || i} className="p-6 bg-white/5 border border-white/10 hover:border-primary/30 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="text-white font-headline uppercase tracking-wider text-sm">{authorName}</h4>
                                        <p className="text-[10px] text-white/40 font-headline uppercase tracking-widest mt-1">SENTIMENT: {sentiment} // {displayDate}</p>
                                    </div>
                                    <div className={`font-bold font-headline text-lg ${ratingColor}`}>{rating}/10</div>
                                </div>
                                <p className="text-white/60 text-sm leading-relaxed italic line-clamp-4 hover:line-clamp-none transition-all cursor-pointer">
                                    &ldquo;{review.review_body || review.reviewBody}&rdquo;
                                </p>
                            </div>
                        );
                    })}
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

            <TrailerModal 
                isOpen={isTrailerOpen} 
                onClose={() => setIsTrailerOpen(false)} 
                videoUrl={movie?.trailerUrl || movie?.trailer_url} 
            />
        </div>
    );
};

export default MovieDetail;
