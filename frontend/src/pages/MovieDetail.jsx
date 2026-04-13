import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Star, Clock, Calendar } from 'lucide-react';

const MovieDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [movie, setMovie] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [reviewForm, setReviewForm] = useState({ rating: 5, body: '', title: '' });

    useEffect(() => {
        api.get(`/movies/${id}`).then(res => setMovie(res.data)).catch(() => {});
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
                sessionId: localStorage.getItem('cv_session_id')
            });
            alert('Review submitted!');
            window.location.reload();
        } catch(e) {
            alert('Failed to submit: ' + (e.response?.data || e.message));
        }
    };

    if (!movie) return <div className="p-12 text-center">Loading movie details...</div>;

    return (
        <div className="space-y-12 pb-16">
            <div className="glass-panel p-8 grid grid-cols-1 md:grid-cols-[300px_1fr] gap-10">
                <div className="rounded-xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-800 aspect-[2/3]">
                    {movie.poster_url && <img src={movie.poster_url} className="w-full h-full object-cover" />}
                </div>
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">{movie.title}</h1>
                    <div className="flex flex-wrap items-center gap-4 mt-6 text-slate-300">
                        <span className="flex items-center gap-1 text-cine-gold font-bold text-xl"><Star className="fill-cine-gold text-cine-gold h-5 w-5" /> {movie.aggregate_rating}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-4 w-4"/> {movie.release_date}</span>
                        <span className="flex items-center gap-1"><Clock className="h-4 w-4"/> {movie.runtime_minutes} min</span>
                        {movie.age_certificate && <span className="px-2 py-0.5 bg-slate-700 rounded border border-slate-600 text-sm font-semibold">{movie.age_certificate}</span>}
                    </div>

                    <div className="mt-8">
                        <h3 className="text-xl font-bold text-white mb-2">Synopsis</h3>
                        <p className="text-slate-300 leading-relaxed text-lg">{movie.synopsis}</p>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <h3 className="text-2xl font-bold text-white border-l-4 border-cine-gold pl-3">User Reviews</h3>
                    {reviews.length === 0 ? <p className="text-slate-400">No reviews yet. Be the first!</p> : null}
                    {reviews.map(r => (
                        <div key={r.id} className="p-6 bg-slate-800/80 rounded-xl border border-slate-700">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h4 className="font-bold text-white text-lg">{r.review_title}</h4>
                                    <p className="text-xs text-slate-400 mt-1">Status: {r.user_id ? 'Registered User' : 'Guest'}</p>
                                </div>
                                <span className={`px-3 py-1 rounded text-sm font-bold ${r.sentiment === 'Positive' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : r.sentiment === 'Mixed' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50' : 'bg-rose-500/20 text-rose-400 border border-rose-500/50'}`}>
                                    {r.sentiment} ({r.rating}/10)
                                </span>
                            </div>
                            <p className="text-slate-300">{r.review_body}</p>
                        </div>
                    ))}
                </div>

                <div className="glass-panel p-6 sticky top-24 self-start">
                    <h3 className="text-xl font-bold text-cine-gold mb-4">Write a Review</h3>
                    {!user && <div className="mb-4 p-3 bg-slate-800 border border-slate-700 text-sm text-slate-300 rounded">You are reviewing as a guest. Sign in to permanently save to your profile.</div>}
                    <form onSubmit={submitReview} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm mb-1 text-slate-400">Rating (1-10)</label>
                            <input type="range" min="1" max="10" value={reviewForm.rating} onChange={e => setReviewForm({...reviewForm, rating: parseInt(e.target.value)})} className="w-full accent-cine-gold" />
                            <div className="text-center font-bold text-white mt-1">{reviewForm.rating}</div>
                        </div>
                        <input type="text" placeholder="Summary Title" required className="bg-slate-900 border border-slate-700 rounded p-3 w-full outline-none focus:border-cine-gold text-white" value={reviewForm.title} onChange={e => setReviewForm({...reviewForm, title: e.target.value})} />
                        <textarea placeholder="Write your thoughts..." required rows="4" className="bg-slate-900 border border-slate-700 rounded p-3 w-full outline-none focus:border-cine-gold text-white" value={reviewForm.body} onChange={e => setReviewForm({...reviewForm, body: e.target.value})} />
                        <button type="submit" className="bg-cine-gold text-slate-900 font-bold py-3 rounded hover:bg-yellow-500 transition">Submit Review</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MovieDetail;
