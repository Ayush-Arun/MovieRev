import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Carousel = ({ title, movies }) => {
    const scrollRef = useRef(null);

    useEffect(() => {
        const interval = setInterval(() => {
            if (scrollRef.current) {
                // If we reach the end, instantly snap back to 0
                if (scrollRef.current.scrollLeft + scrollRef.current.clientWidth >= scrollRef.current.scrollWidth - 10) {
                    scrollRef.current.scrollTo({ left: 0, behavior: 'instant' });
                } else {
                    scrollRef.current.scrollBy({ left: 224, behavior: 'smooth' }); // 200px card + 24px gap
                }
            }
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = 224; // 200px card + 24px gap
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (!movies || movies.length === 0) {
        if (title === "ALL-TIME MASTERPIECES") {
            return (
                <div className="my-12 relative w-full opacity-50">
                    <h2 className="text-xl font-headline font-bold text-white uppercase tracking-widest border-l-4 border-primary pl-4 mb-6">{title}</h2>
                    <div className="flex gap-6 overflow-hidden">
                        {Array(6).fill(0).map((_, i) => (
                            <div key={i} className="min-w-[200px] aspect-[2/3] bg-surface-container-low animate-pulse border border-white/5 rounded-xl border-dashed">
                                <div className="h-full w-full flex items-center justify-center">
                                    <span className="font-headline text-[10px] tracking-widest opacity-20">INGESTING_RECORDS...</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    }

    return (
        <div className="my-12 relative w-full group/carousel">
            <h2 className="text-xl font-headline font-bold text-white uppercase tracking-widest border-l-4 border-primary pl-4 mb-6">{title}</h2>
            
            {/* Navigation Arrows */}
            <button 
                onClick={() => scroll('left')}
                className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-20 bg-surface-container-highest/80 hover:bg-primary border border-white/10 text-white hover:text-black p-2 rounded-full opacity-0 group-hover/carousel:opacity-100 transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)] md:flex hidden"
            >
                <span className="material-symbols-outlined">chevron_left</span>
            </button>
            
            <button 
                onClick={() => scroll('right')}
                className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-20 bg-surface-container-highest/80 hover:bg-primary border border-white/10 text-white hover:text-black p-2 rounded-full opacity-0 group-hover/carousel:opacity-100 transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)] md:flex hidden"
            >
                <span className="material-symbols-outlined">chevron_right</span>
            </button>

            <div 
                ref={scrollRef} 
                className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4 scroll-smooth"
            >
                {movies.map(m => (
                    <div key={m.id} className="min-w-[200px] snap-start relative group rounded-xl overflow-hidden border border-white/5 bg-surface-container hover:border-primary/50 transition-colors">
                        <Link to={`/movie/${m.id}`}>
                            <div className="aspect-[2/3] w-[200px] relative overflow-hidden">
                                <img src={m.posterUrl || m.poster_url} alt={m.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-100 flex flex-col justify-end p-4 transition-opacity">
                                    <h3 className="font-bold text-white text-sm truncate uppercase tracking-widest font-headline">{m.title}</h3>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-xs text-primary font-bold">{(m.aggregateRating || m.aggregate_rating) ? `★ ${(m.aggregateRating || m.aggregate_rating).toFixed(1)}` : ''}</span>
                                        <span className="text-[10px] text-white/50">{(m.releaseDate || m.release_date || '0000').substring(0,4)}</span>
                                    </div>
                                    {m.genres && (
                                        <span className="text-[9px] text-white/30 uppercase mt-1 truncate">
                                            {Array.isArray(m.genres) ? m.genres.slice(0, 3).map(g => g.name || g).join(' / ') : m.genres}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
            
            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default Carousel;
