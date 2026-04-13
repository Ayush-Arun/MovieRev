import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';

const GlitchMovieCard = ({ m }) => (
    <div className="group bg-surface-container-low poster-glow transition-all rounded-sm overflow-hidden select-none">
        <Link to={`/movie/${m.id}`} className="block aspect-[2/3] overflow-hidden bg-black relative">
            {m.poster_url ? (
                <img src={m.poster_url} className="w-full h-full object-cover grayscale contrast-125 brightness-75 group-hover:brightness-100 group-hover:grayscale-0 transition-all duration-500" alt={m.title} />
            ) : (
                <div className="w-full h-full flex flex-col justify-center items-center opacity-30 text-white font-headline">
                   <span className="material-symbols-outlined text-4xl mb-2">broken_image</span>
                   <span className="text-[10px] tracking-widest uppercase">DATA_MISSING</span>
                </div>
            )}
        </Link>
        <div className="p-4 md:p-6 border-t border-white/5 relative bg-gradient-to-t from-surface-container-lowest to-transparent">
            <span className="font-headline text-[10px] tracking-widest text-secondary block mb-2 font-bold italic uppercase truncate">{m.genres ? m.genres.split(',')[0] : 'STATUS: ANOMALY'}</span>
            <Link to={`/movie/${m.id}`} className="text-xl font-bold uppercase tracking-tight mb-2 block hover:text-primary transition-colors font-headline truncate">{m.title}</Link>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-headline">{new Date(m.release_date).getFullYear()} // RATING: {m.aggregate_rating}</p>
            
            <div className="mt-4 flex gap-1 h-1">
                {Array(5).fill(0).map((_, i) => (
                    <div key={i} className={`flex-1 ${i < Math.round(m.aggregate_rating / 2) ? 'bg-primary' : 'bg-surface-variant'}`}></div>
                ))}
            </div>
        </div>
    </div>
);

export const Home = () => {
    const [movies, setMovies] = useState([]);

    useEffect(() => {
        api.get('/movies').then(res => setMovies(res.data.slice(0, 10))).catch(() => {});
    }, []);

    const featured = movies[0];
    const latest = movies.slice(1, 5);

    return (
        <div className="px-2 md:px-6 py-8 max-w-7xl mx-auto space-y-16">
            
            {/* Hero / featured */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="w-3 h-3 bg-primary animate-pulse"></span>
                        <span className="font-headline uppercase tracking-[0.3em] text-[10px] text-primary font-bold">DIRECTORY: /SYSTEM/CORE/MANIFESTO</span>
                    </div>
                    <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] italic font-headline mb-4">FILM IS<br/><span className="text-primary italic">SURVEILLANCE</span></h2>
                    <p className="text-white/60 font-body text-sm md:text-base max-w-lg leading-relaxed">An exploration into the digital decay of the cinematic medium. We curate anomalies, analyze glitches, and document the slow death of celluloid.</p>
                </div>
            </div>

            {featured && (
                <div className="lg:col-span-4 bg-primary-container p-8 md:p-12 flex flex-col md:flex-row items-center gap-12 group cursor-pointer overflow-hidden relative shadow-[0_0_50px_rgba(202,253,0,0.1)] hover:shadow-[0_0_80px_rgba(202,253,0,0.2)] transition-shadow">
                    <div className="flex-1 z-10">
                        <div className="font-headline uppercase tracking-[0.5em] text-on-primary-container text-[10px] mb-4 font-black">CRITICAL_RECOMMENDATION // V1.0</div>
                        <h3 className="text-on-primary-container text-5xl md:text-6xl font-black uppercase tracking-tighter leading-tight font-headline">{featured.title}</h3>
                        <p className="text-on-primary-container/80 max-w-xl mt-6 font-medium italic font-body">{featured.description || "A masterful documentation of reality distortion."}</p>
                        <Link to={`/movie/${featured.id}`} className="inline-block mt-8 border-2 border-on-primary-container px-8 py-3 font-headline font-bold uppercase tracking-widest text-xs hover:bg-on-primary-container hover:text-primary-container transition-all">ACCESS_DATA_RECORDS</Link>
                    </div>
                    <div className="w-full md:w-1/3 aspect-video md:aspect-[4/5] bg-black overflow-hidden relative z-10 shadow-2xl skew-x-[-2deg] group-hover:skew-x-0 transition-transform">
                        <img className="w-full h-full object-cover grayscale contrast-150" src={featured.poster_url || "https://images.unsplash.com/photo-1549488344-c6a617d3dcb1"} />
                        <div className="absolute inset-0 bg-primary-container/10 mix-blend-overlay"></div>
                    </div>
                    <div className="absolute right-0 top-0 text-[8rem] md:text-[12rem] font-black text-on-primary-container/5 leading-none translate-x-12 translate-y-[-2rem] pointer-events-none uppercase font-headline">ANOMALY</div>
                </div>
            )}

            {/* Latest Grid */}
            <section>
                <div className="flex items-end justify-between border-b-2 border-primary mb-8 pb-2">
                    <h2 className="text-2xl md:text-3xl font-black text-on-surface uppercase tracking-tight font-headline">LATEST_ANOMALIES</h2>
                    <span className="font-headline uppercase tracking-widest text-[8px] text-white/40">SORTED: GL_DL_RM</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {latest.map(m => <GlitchMovieCard key={m.id} m={m} />)}
                    {movies.length === 0 && Array(4).fill(0).map((_, i) => <div key={i} className="aspect-[2/3] bg-surface-container-low animate-pulse border border-white/5" />)}
                </div>
            </section>
        </div>
    );
};

export const Browse = () => {
    const [movies, setMovies] = useState([]);
    const [search, setSearch] = useState(() => {
        return new URLSearchParams(window.location.search).get('search') || '';
    });

    useEffect(() => {
        const fetchUrl = search ? `/movies/search?q=${search}` : '/movies';
        api.get(fetchUrl).then(res => setMovies(res.data)).catch(() => {});
    }, [search]);

    return (
        <div className="px-2 md:px-6 py-8 max-w-7xl mx-auto space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="w-3 h-3 bg-secondary"></span>
                        <span className="font-headline uppercase tracking-[0.3em] text-[10px] text-secondary font-bold">DIRECTORY: /SYSTEM/INDEX/ALL_RECORDS</span>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none italic font-headline">THE_VOID</h2>
                    <p className="text-white/40 font-headline uppercase tracking-[0.1em] text-xs">CURATED COLLECTIONS OF VISUAL DISTORTION. {movies.length} ENTRIES FOUND DETECTED.</p>
                </div>
                
                <div className="flex bg-surface-container-highest px-4 py-2 gap-3 border-b-2 border-primary w-full md:w-auto mt-4 md:mt-0">
                    <span className="material-symbols-outlined text-primary text-sm">search</span>
                    <input 
                        type="text" 
                        placeholder="SEARCH_INDEX..." 
                        className="bg-transparent border-none focus:ring-0 text-xs font-headline uppercase tracking-widest text-on-surface p-0 w-full md:w-64 focus:outline-none"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                 </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {movies.map(m => <GlitchMovieCard key={m.id} m={m} />)}
                {movies.length === 0 && search === '' && Array(8).fill(0).map((_, i) => <div key={i} className="aspect-[2/3] bg-surface-container-low animate-pulse border border-white/5" />)}
            </div>

            {/* Pagination Style Element */}
            {movies.length > 0 && (
                <div className="mt-24 mb-16 border-t border-white/5 pt-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="font-headline text-[10px] text-white/20 tracking-[0.5em] uppercase">SYSTEM_PAGE_01_OF_0X</div>
                    <div className="flex items-center gap-2">
                        <div className="h-10 w-10 flex items-center justify-center border border-white/10 text-white/20"><span className="material-symbols-outlined">chevron_left</span></div>
                        <div className="h-10 w-10 flex items-center justify-center bg-secondary text-on-secondary font-headline text-xs font-bold">1</div>
                        <div className="h-10 w-10 flex items-center justify-center border border-white/10 text-white/60 hover:text-secondary hover:border-secondary transition-colors cursor-pointer font-headline text-xs font-bold">2</div>
                        <div className="h-10 w-10 flex items-center justify-center border border-white/10 text-white/60 hover:text-secondary hover:border-secondary transition-colors cursor-pointer"><span className="material-symbols-outlined">chevron_right</span></div>
                    </div>
                </div>
            )}
        </div>
    );
};
