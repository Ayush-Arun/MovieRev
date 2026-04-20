import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const HeroCarousel = ({ movies }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        if (!movies || movies.length <= 1) return;

        const interval = setInterval(() => {
            advance();
        }, 6000);

        return () => clearInterval(interval);
    }, [movies, currentIndex]);

    const advance = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % movies.length);
            setIsTransitioning(false);
        }, 500);
    };

    if (!movies || movies.length === 0) return null;

    const currentMovie = movies[currentIndex];

    return (
        <div className="lg:col-span-4 bg-primary-container p-8 md:p-12 flex flex-col md:flex-row items-center gap-12 group cursor-pointer overflow-hidden relative shadow-[0_0_50px_rgba(202,253,0,0.1)] hover:shadow-[0_0_80px_rgba(202,253,0,0.2)] transition-all duration-700 min-h-[500px]">
            {/* Background Text Decor */}
            <div className="absolute right-0 top-0 text-[8rem] md:text-[12rem] font-black text-on-primary-container/5 leading-none translate-x-12 translate-y-[-2rem] pointer-events-none uppercase font-headline select-none">
                {currentMovie.original_language === 'hi' ? 'BOLLYWOOD' : 'ANOMALY'}
            </div>

            <div className={`flex-1 z-10 transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-x-[-20px]' : 'opacity-100 translate-x-0'}`}>
                <div className="flex items-center gap-3 mb-4">
                    {currentMovie.ageCertificate && (
                        <span className={`text-[10px] font-bold px-2 py-1 border rounded ${
                            currentMovie.ageCertificate === 'A' || currentMovie.ageCertificate === 'R' ? 'border-red-500 text-red-500' :
                            currentMovie.ageCertificate === 'UA' || currentMovie.ageCertificate === 'PG-13' ? 'border-amber-500 text-amber-500' :
                            'border-green-500 text-green-500'
                        }`}>
                            {currentMovie.ageCertificate}
                        </span>
                    )}
                    <div className="font-headline uppercase tracking-[0.5em] text-on-primary-container text-[10px] font-black">
                        CRITICAL_RECOMMENDATION // V{currentIndex + 1}.0
                    </div>
                </div>
                
                <h3 className="text-on-primary-container text-5xl md:text-6xl font-black uppercase tracking-tighter leading-tight font-headline">
                    {currentMovie.title}
                </h3>
                
                <p className="text-on-primary-container/80 max-w-xl mt-6 font-medium italic font-body line-clamp-3">
                    {currentMovie.synopsis || currentMovie.description || "A masterful documentation of reality distortion."}
                </p>
                
                <div className="flex items-center gap-6 mt-8">
                    <Link to={`/movie/${currentMovie.id}`} className="inline-block border-2 border-on-primary-container px-8 py-3 font-headline font-bold uppercase tracking-widest text-xs hover:bg-on-primary-container hover:text-primary-container transition-all">
                        ACCESS_DATA_RECORDS
                    </Link>
                    
                    {/* Navigation Dots */}
                    <div className="flex gap-2">
                        {movies.slice(0, 5).map((_, idx) => (
                            <button 
                                key={idx}
                                onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                                className={`h-1 transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-on-primary-container' : 'w-2 bg-on-primary-container/20'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className={`w-full md:w-1/3 aspect-[4/5] bg-black overflow-hidden relative z-10 shadow-2xl skew-x-[-2deg] group-hover:skew-x-0 transition-all duration-700 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                <img 
                    className="w-full h-full object-cover grayscale contrast-150 group-hover:grayscale-0 group-hover:contrast-100 transition-all duration-700" 
                    src={currentMovie.poster_url || "https://images.unsplash.com/photo-1549488344-c6a617d3dcb1"} 
                    alt={currentMovie.title}
                />
                <div className="absolute inset-0 bg-primary-container/10 mix-blend-overlay"></div>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 h-1 bg-on-primary-container/30 w-full">
                <div 
                    key={currentIndex} 
                    className="h-full bg-on-primary-container animate-progress-grow"
                    style={{ animationDuration: '6000ms' }}
                />
            </div>

            <style>{`
                @keyframes progress-grow {
                    from { width: 0%; }
                    to { width: 100%; }
                }
                .animate-progress-grow {
                    animation-name: progress-grow;
                    animation-timing-function: linear;
                }
            `}</style>
        </div>
    );
};

export default HeroCarousel;
