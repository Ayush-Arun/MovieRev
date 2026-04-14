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

    if (!movies || movies.length === 0) return null;

    return (
        <div className="my-12 relative w-full">
            <h2 className="text-xl font-headline font-bold text-white uppercase tracking-widest border-l-4 border-primary pl-4 mb-6">{title}</h2>
            
            <div 
                ref={scrollRef} 
                className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4"
            >
                {movies.map(m => (
                    <div key={m.id} className="min-w-[200px] snap-start relative group rounded-xl overflow-hidden border border-white/5 bg-surface-container hover:border-primary/50 transition-colors">
                        <Link to={`/movie/${m.id}`}>
                            <div className="aspect-[2/3] w-[200px] relative overflow-hidden">
                                <img src={m.posterUrl || m.poster_url} alt={m.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-100 flex flex-col justify-end p-4 transition-opacity">
                                    <h3 className="font-bold text-white text-sm truncate uppercase tracking-widest font-headline">{m.title}</h3>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-xs text-primary font-bold">{m.aggregateRating || m.aggregate_rating ? `★ ${(m.aggregateRating || m.aggregate_rating).toFixed(1)}` : ''}</span>
                                        <span className="text-[10px] text-white/50">{m.releaseDate ? (m.releaseDate || m.release_date).substring(0,4) : ''}</span>
                                    </div>
                                    {m.genres && (
                                        <span className="text-[9px] text-white/30 uppercase mt-1 truncate">{m.genres}</span>
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
