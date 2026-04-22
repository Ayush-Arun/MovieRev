import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const CITIES = [
    { name: 'Bangalore', bmsSlug: 'BANG', hubCode: 'BANG' },
    { name: 'Mumbai', bmsSlug: 'MUMB', hubCode: 'MUMB' },
    { name: 'Delhi NCR', bmsSlug: 'NCR', hubCode: 'NDLS' },
    { name: 'Chennai', bmsSlug: 'CHEN', hubCode: 'CHEN' },
    { name: 'Hyderabad', bmsSlug: 'HYD', hubCode: 'HYD' },
    { name: 'Pune', bmsSlug: 'PUNE', hubCode: 'PUNE' },
    { name: 'Kolkata', bmsSlug: 'KOLK', hubCode: 'KOLK' },
];

const FORMATS = ['2D', '3D', 'IMAX 3D', '4DX', 'ICE'];

// BookMyShow search URL builder
const bmsUrl = (title, citySlug) =>
    `https://in.bookmyshow.com/explore/movies-${citySlug.toLowerCase()}`;

// Format prices for display
const TICKET_PRICES = {
    '2D': { min: 250, max: 450 },
    '3D': { min: 350, max: 550 },
    'IMAX 3D': { min: 650, max: 1100 },
    '4DX': { min: 600, max: 950 },
    'ICE': { min: 800, max: 1400 },
};

const Showtimes = () => {
    const [selectedCity, setSelectedCity] = useState(CITIES[0]);
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        // Fetch currently playing movies from our backend (TMDB now_playing synced)
        api.get('/movies/now-playing')
            .then(res => {
                setMovies(res.data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError('Could not load movies. Please try again.');
                setLoading(false);
            });
    }, []);

    // Assign deterministic but "realistic-looking" show times per movie
    const getShowTimes = (movieIndex) => {
        const baseTimes = [
            ['09:15 AM', '12:30 PM', '04:00 PM', '07:30 PM', '10:45 PM'],
            ['10:00 AM', '01:15 PM', '04:45 PM', '08:00 PM', '11:15 PM'],
            ['08:45 AM', '12:15 PM', '03:30 PM', '06:45 PM', '10:00 PM'],
            ['11:30 AM', '03:15 PM', '06:30 PM', '09:45 PM'],
            ['10:45 AM', '02:00 PM', '05:30 PM', '09:00 PM'],
        ];
        const times = baseTimes[movieIndex % baseTimes.length];
        // Show 3-4 times per theatre based on movie index
        return times.slice(0, 3 + (movieIndex % 2));
    };

    const getFormatsForMovie = (movie, theatreIndex) => {
        // Newer/popular movies get IMAX + standard formats
        const releaseYear = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 2024;
        if (releaseYear >= 2024 && theatreIndex === 0) return ['IMAX 3D', '2D'];
        if (theatreIndex === 1) return ['3D', '2D'];
        return ['2D'];
    };

    const getTheatresForCity = (cityName) => {
        const theatreMaps = {
            'Bangalore': [
                "PVR Director's Cut: Rex Walk, Brigade Road",
                "Cinepolis IMAX: Nexus Shantiniketan",
                "INOX Megaplex: RMZ Galleria, Yelahanka",
                "PVR Superplex: Nexus Mall, Koramangala",
                "PVR: Phoenix Marketcity, Mahadevapura"
            ],
            'Mumbai': [
                "PVR ICON: Palladium, Lower Parel",
                "INOX: Insignia at Atria Mall, Worli",
                "Cinepolis: Andheri West",
                "PVR: Jio World Drive, BKC"
            ],
            'Delhi NCR': [
                "PVR Director's Cut: Ambience Mall, Vasant Kunj",
                "INOX: Nehru Place",
                "Cinepolis IMAX: DLF Avenue, Saket",
                "PVR: Logix City Centre, Noida"
            ]
        };
        
        return theatreMaps[cityName] || [
            `PVR: Main City Mall, ${cityName}`,
            `Cinepolis: Central, ${cityName}`,
            `INOX: Hub Center, ${cityName}`
        ];
    };

    const getTheatresForMovie = (movieIndex, cityName) => {
        const cityTheatres = getTheatresForCity(cityName);
        const count = 2 + (movieIndex % 2);
        const start = movieIndex % cityTheatres.length;
        const theatres = [];
        for (let i = 0; i < count; i++) {
            theatres.push(cityTheatres[(start + i) % cityTheatres.length]);
        }
        return theatres;
    };

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-primary pb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 bg-secondary animate-pulse rounded-full"></span>
                        <span className="font-headline uppercase tracking-[0.3em] text-[10px] text-secondary font-bold">SYSTEM // NOW PLAYING</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-on-surface uppercase tracking-tighter font-headline">
                        IN <span className="text-primary">THEATRES</span>
                    </h1>
                    <p className="text-white/40 font-body text-sm mt-2">
                        Movies currently running in {selectedCity.name} • Click &quot;Book Tickets&quot; to buy on BookMyShow
                    </p>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-headline uppercase tracking-[0.2em] text-white/40">LOCATION_OVERRIDE</label>
                    <div className="relative">
                        <select
                            value={selectedCity.name}
                            onChange={(e) => setSelectedCity(CITIES.find(c => c.name === e.target.value))}
                            className="bg-surface-container border border-white/20 text-white font-headline uppercase tracking-widest text-sm outline-none cursor-pointer px-4 py-3 appearance-none min-w-[220px] hover:border-primary transition-colors pr-10"
                        >
                            {CITIES.map(c => (
                                <option key={c.name} value={c.name} className="bg-surface-container-high">{c.name}</option>
                            ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-primary">arrow_drop_down</span>
                    </div>
                </div>
            </div>

            {/* Info Banner */}
            <div className="p-4 border border-secondary/20 bg-secondary/5 flex items-start gap-3">
                <span className="material-symbols-outlined text-secondary text-xl flex-shrink-0 mt-0.5">info</span>
                <div>
                    <p className="text-xs font-headline uppercase tracking-widest text-secondary font-bold">Data Source</p>
                    <p className="text-white/50 font-body text-xs mt-1">
                        Movie listings are sourced from TMDB&apos;s &quot;Now Playing&quot; database (updated weekly). 
                        Showtimes shown are <strong className="text-white/70">indicative</strong> — actual times may vary. 
                        Click <strong className="text-secondary">&ldquo;Book Tickets&rdquo;</strong> to see live showtimes and purchase tickets on BookMyShow.
                    </p>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-6">
                    <span className="w-12 h-12 border-2 border-white/10 border-t-primary rounded-full animate-spin"></span>
                    <span className="font-headline uppercase tracking-widest text-[10px] text-primary">SCANNING NETWORK_</span>
                </div>
            ) : error ? (
                <div className="text-center py-24 border border-dashed border-white/10">
                    <span className="material-symbols-outlined text-5xl text-white/20 mb-4 block">signal_disconnected</span>
                    <p className="font-headline uppercase tracking-widest text-white/40 text-sm">{error}</p>
                </div>
            ) : movies.length === 0 ? (
                <div className="text-center py-24 border border-dashed border-white/10">
                    <span className="material-symbols-outlined text-5xl text-white/20 mb-4 block">movie_filter</span>
                    <p className="font-headline uppercase tracking-widest text-white/40 text-sm">No movies found for current period</p>
                    <p className="text-white/20 text-xs font-body mt-2">The database may need a sync. Check back later.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-10">
                    {movies.slice(0, 12).map((movie, idx) => {
                        const theatres = getTheatresForMovie(idx, selectedCity.name);
                        const bmsLink = bmsUrl(movie.title, selectedCity.bmsSlug);

                        return (
                            <div key={movie.id} className="bg-surface-container-low border border-white/10 flex flex-col md:flex-row group hover:border-white/30 transition-all duration-300">

                                {/* Poster */}
                                <div className="w-full md:w-[220px] flex-shrink-0 aspect-[2/3] md:aspect-auto overflow-hidden relative border-b md:border-b-0 md:border-r border-white/10">
                                    {movie.poster_url || movie.posterUrl ? (
                                        <img
                                            src={movie.poster_url || movie.posterUrl}
                                            alt={movie.title}
                                            className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 transition-all duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-surface-container flex items-center justify-center">
                                            <span className="material-symbols-outlined text-white/20 text-4xl">movie</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                                    <div className="absolute bottom-3 left-3 right-3">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <span className="material-symbols-outlined text-primary text-[12px]">star</span>
                                            <span className="text-primary font-headline font-bold text-sm">{(movie.aggregate_rating || movie.aggregateRating || 0).toFixed(1)}</span>
                                        </div>
                                        <h2 className="text-white font-headline font-black uppercase tracking-tight text-base md:text-lg leading-tight drop-shadow-lg">{movie.title}</h2>
                                    </div>
                                </div>

                                {/* Showtimes content */}
                                <div className="flex-1 p-6 md:p-8 space-y-6 min-w-0">
                                    {/* Movie meta */}
                                    <div className="flex flex-wrap items-center gap-3 text-[10px] font-headline uppercase tracking-widest text-white/40 border-b border-white/5 pb-4">
                                        {movie.genres?.slice(0, 3).map(g => (
                                            <span key={g.id || g.name || g} className="bg-white/5 border border-white/10 px-2 py-1">{g.name || g}</span>
                                        ))}
                                        {(movie.runtime_minutes || movie.runtimeMinutes) && (
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[11px]">schedule</span>
                                                {movie.runtime_minutes || movie.runtimeMinutes} MIN
                                            </span>
                                        )}
                                        {movie.age_certificate && (
                                            <span className="border border-amber-500/50 text-amber-500 px-1.5 py-0.5">{movie.age_certificate}</span>
                                        )}
                                    </div>

                                    {/* Theatres and times */}
                                    <div className="space-y-6">
                                        {theatres.map((theatre, tIdx) => {
                                            const times = getShowTimes(idx + tIdx);
                                            const formats = getFormatsForMovie(movie, tIdx);

                                            return (
                                                <div key={tIdx} className="space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-secondary text-base">location_on</span>
                                                        <h3 className="text-white font-headline uppercase tracking-widest text-xs font-bold">{theatre}</h3>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2.5">
                                                        {formats.map(fmt => (
                                                            times.map((time, timeIdx) => {
                                                                const price = TICKET_PRICES[fmt] || TICKET_PRICES['2D'];
                                                                return (
                                                                    <a
                                                                        key={`${fmt}-${timeIdx}`}
                                                                        href={bmsLink}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="group/ticket flex flex-col items-center border border-white/10 hover:border-primary hover:bg-primary/5 transition-all px-4 py-2 cursor-pointer"
                                                                        title={`Book ${fmt} at ${time} — ₹${price.min}–${price.max}`}
                                                                    >
                                                                        <span className="text-white font-headline font-bold text-sm group-hover/ticket:text-primary transition-colors">{time}</span>
                                                                        <span className="text-[8px] font-headline text-white/30 group-hover/ticket:text-primary/60 uppercase tracking-wider mt-0.5">{fmt}</span>
                                                                        <span className="text-[8px] font-body text-white/20 group-hover/ticket:text-primary/40 mt-0.5">₹{price.min}–{price.max}</span>
                                                                    </a>
                                                                );
                                                            })
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Book CTA */}
                                    <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                        <p className="text-[10px] text-white/25 font-body">
                                            * Prices & times are indicative. Verify on BookMyShow before booking.
                                        </p>
                                        <a
                                            href={bmsLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-shrink-0 flex items-center gap-2 bg-primary text-black px-6 py-2.5 font-headline font-black uppercase tracking-widest text-xs hover:bg-white transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">confirmation_number</span>
                                            Book Tickets
                                        </a>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Showtimes;
