package com.cinevault.service;

import com.cinevault.dto.tmdb.*;
import com.cinevault.entity.*;
import com.cinevault.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.HashSet;
import java.util.UUID;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class TmdbSyncService {

    @Value("${app.tmdb.api-key}")
    private String apiKey;

    @Value("${app.tmdb.base-url}")
    private String baseUrl;
    
    @Value("${app.tmdb.image-base:https://image.tmdb.org/t/p/w500}")
    private String imageBaseUrl;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private GenreRepository genreRepository;
    
    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private OttPlatformRepository ottPlatformRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final RestTemplate restTemplate = new RestTemplate();

    private final List<String> contentBlacklist = Arrays.asList(
        "sex", "nude", "nudity", "porn", "erotica", "adult movie", "gay porn", "lesbian porn", "xxx", "uwakizuma"
    );


    public void syncHollywoodMovies() {
        String url = baseUrl + "/discover/movie?api_key=" + apiKey + "&with_original_language=en&sort_by=popularity.desc&include_adult=false&vote_count.gte=1000";
        fetchAndSaveMovies(url);
    }

    public void syncBollywoodMovies() {
        String url = baseUrl + "/discover/movie?api_key=" + apiKey + "&with_original_language=hi&region=IN&sort_by=popularity.desc&include_adult=false&vote_count.gte=100";
        fetchAndSaveMovies(url);
    }

    public void syncSouthIndianMovies() {
        String[] languages = {"ta", "te", "ml", "kn"};
        for (String lang : languages) {
            String url = baseUrl + "/discover/movie?api_key=" + apiKey + "&with_original_language=" + lang + "&region=IN&sort_by=popularity.desc&include_adult=false&vote_count.gte=50";
            fetchAndSaveMovies(url);
        }
    }

    public void syncDecadeMovies() {
        int currentYear = LocalDate.now().getYear();
        for (int year = currentYear - 10; year < currentYear; year++) {
            System.out.println("Syncing top movies for year: " + year);
            String url = baseUrl + "/discover/movie?api_key=" + apiKey + "&primary_release_year=" + year + "&sort_by=vote_average.desc&vote_count.gte=500&include_adult=false";
            fetchAndSaveMovies(url);
        }
    }

    public void syncNowPlayingMovies() {
        System.out.println("Syncing NOW PLAYING movies from TMDB...");
        String url = baseUrl + "/movie/now_playing?api_key=" + apiKey + "&region=IN&language=en-US";
        fetchAndSaveMovies(url);
    }

    public void syncTopRatedMovies() {
        System.out.println("Syncing TOP RATED ALL-TIME masterpieces from TMDB...");
        // Fetch multiple pages to get a solid 'Top 100'
        for (int i = 1; i <= 5; i++) {
            String url = baseUrl + "/movie/top_rated?api_key=" + apiKey + "&page=" + i + "&language=en-US";
            fetchAndSaveMovies(url);
        }
    }

    @Async
    public void syncCuratedMasterpieces() {
        System.out.println("Syncing CURATED All-Time Masterpieces...");
        
        // Clear existing masterpieces first
        jdbcTemplate.update("UPDATE movies SET is_masterpiece = FALSE");

        List<String> titles = Arrays.asList(
            "The Godfather", "The Shawshank Redemption", "Schindler's List", "Raging Bull", "Casablanca",
            "Citizen Kane", "Gone with the Wind", "The Wizard of Oz", "One Flew Over the Cuckoo's Nest",
            "Lawrence of Arabia", "Vertigo", "Psycho", "The Godfather Part II", "On the Waterfront",
            "Sunset Blvd.", "Forrest Gump", "The Sound of Music", "12 Angry Men", "West Side Story",
            "Star Wars: Episode IV – A New Hope", "2001: A Space Odyssey", "E.T. the Extra-Terrestrial", "The Silence of the Lambs",
            "Chinatown", "The Bridge on the River Kwai", "Singin' in the Rain", "It's a Wonderful Life",
            "Dr. Strangelove", "All About Eve", "The Great Escape", "North by Northwest", "Jaws",
            "Rocky", "The Deer Hunter", "The Wild Bunch", "The Apartment", "Goodfellas", "Apocalypse Now",
            "Amadeus", "Taxi Driver", "Double Indemnity", "Modern Times", "To Kill a Mockingbird",
            "Mr. Smith Goes to Washington", "Rear Window", "The Third Man", "The Maltese Falcon",
            "A Clockwork Orange", "The Treasure of the Sierra Madre", "Butch Cassidy and the Sundance Kid",
            "The Graduate", "Platoon", "The Best Years of Our Lives", "Ben-Hur", "The Exorcist",
            "The Pianist", "Gladiator", "Titanic", "Saving Private Ryan", "Braveheart",
            "Terminator 2: Judgment Day", "Back to the Future", "Alien", "The Shining",
            "Raiders of the Lost Ark", "Indiana Jones and the Last Crusade", "Jurassic Park", "The Matrix",
            "The Lord of the Rings: The Fellowship of the Ring", "The Lord of the Rings: The Two Towers",
            "The Lord of the Rings: The Return of the King", "Harry Potter and the Sorcerer's Stone",
            "Harry Potter and the Deathly Hallows: Part 2", "Pirates of the Caribbean: The Curse of the Black Pearl",
            "Spider-Man 2", "The Dark Knight", "Inception", "Fight Club", "Pulp Fiction", "Reservoir Dogs",
            "Se7en", "The Usual Suspects", "American Beauty", "The Green Mile", "The Lion King",
            "Toy Story", "Finding Nemo", "Up", "WALL·E", "Inside Out", "Coco", "Avengers: Infinity War",
            "Avengers: Endgame", "Interstellar", "Dunkirk", "The Prestige", "Memento", "Whiplash", "La La Land"
        );

        for (String title : titles) {
            System.out.println(">>> MASTERPIECE SYNC: Processing [" + title + "]");
            List<Movie> results = searchAndIngest(title);
            if (!results.isEmpty()) {
                Movie m = results.get(0);
                System.out.println(">>> MASTERPIECE SYNC: Match found for [" + title + "] -> TMDB ID: " + m.getTmdbId());
                m.setIsMasterpiece(true);
                movieRepository.save(m);
            } else {
                System.err.println(">>> MASTERPIECE SYNC: NO MATCH FOUND FOR [" + title + "]");
            }
        }
        System.out.println(">>> MASTERPIECE SYNC: COMPLETED COLLECTION SYNC.");
    }

    public void fetchAndSaveMovies(String url) {
        if (apiKey == null || apiKey.isEmpty()) {
            throw new IllegalStateException("TMDB API Key is not configured.");
        }
        
        ResponseEntity<TmdbResponse<TmdbMovieDto>> response = restTemplate.exchange(
            url, HttpMethod.GET, null, new ParameterizedTypeReference<TmdbResponse<TmdbMovieDto>>() {}
        );
        
        if (response.getBody() != null && response.getBody().getResults() != null) {
            List<TmdbMovieDto> movies = response.getBody().getResults();
            for (TmdbMovieDto dto : movies) {
                syncMovieDetails(dto.getId());
            }
        }
    }

    @Transactional
    public Movie syncMovieDetails(Integer tmdbId) {
        if (apiKey == null || apiKey.isEmpty()) {
            System.err.println("TMDB API Key missing, skipping sync.");
            return null;
        }

        String detailsUrl = baseUrl + "/movie/" + tmdbId + "?api_key=" + apiKey;
        String creditsUrl = baseUrl + "/movie/" + tmdbId + "/credits?api_key=" + apiKey;
        String reviewsUrl = baseUrl + "/movie/" + tmdbId + "/reviews?api_key=" + apiKey;
        
        try {
            ResponseEntity<TmdbMovieDto> movieResponse = restTemplate.getForEntity(detailsUrl, TmdbMovieDto.class);
            TmdbMovieDto movieDto = movieResponse.getBody();
            if (movieDto == null) return null;

            if (movieDto.isAdult() || isContentInappropriate(movieDto)) {
                System.out.println("Skipping/removing inappropriate movie: " + movieDto.getTitle());
                movieRepository.findByTmdbId(tmdbId).ifPresent(m -> movieRepository.delete(m));
                return null;
            }

            // Enforce: only save movies with a real poster image
            if (movieDto.getPosterPath() == null || movieDto.getPosterPath().isEmpty()) {
                System.out.println("Skipping movie without poster: " + movieDto.getTitle());
                movieRepository.findByTmdbId(tmdbId).ifPresent(m -> movieRepository.delete(m));
                return null;
            }
            
            // Save or Update Movie
            boolean isNewMovie = movieRepository.findByTmdbId(tmdbId).isEmpty();
            Movie movie = movieRepository.findByTmdbId(tmdbId).orElse(new Movie());
            movie.setTmdbId(movieDto.getId());
            movie.setTitle(movieDto.getTitle());
            movie.setOriginalLanguage(movieDto.getOriginalLanguage());
            try {
                if (movieDto.getReleaseDate() != null && !movieDto.getReleaseDate().isEmpty()) {
                    movie.setReleaseDate(LocalDate.parse(movieDto.getReleaseDate()));
                }
            } catch (Exception e) {}
            
            movie.setSynopsis(movieDto.getOverview());
            if (movieDto.getPosterPath() != null) movie.setPosterUrl(imageBaseUrl + movieDto.getPosterPath());
            movie.setAggregateRating(movieDto.getVoteAverage());
            
            // Sync Age Rating
            syncAgeRating(tmdbId, movie);

            if (movieDto.getGenres() != null && !movieDto.getGenres().isEmpty()) {
                movie.getGenres().clear();
                for (TmdbMovieDto.Genre g : movieDto.getGenres()) {
                    Genre genre = genreRepository.findById(g.getId())
                        .orElseGet(() -> genreRepository.save(new Genre(g.getId(), g.getName())));
                    movie.getGenres().add(genre);
                }
            }
            if (movieDto.getRuntime() != null && movieDto.getRuntime() > 0) {
                movie.setRuntimeMinutes(movieDto.getRuntime());
            } else {
                movie.setRuntimeMinutes(null);
            }
            
            Movie savedMovie = movieRepository.save(movie);

            // Fetch Credits
            syncCredits(tmdbId, savedMovie);

            // Fetch Rich metadata
            syncTrailers(tmdbId, savedMovie);
            syncWatchProviders(tmdbId, savedMovie);
            syncReviews(tmdbId, savedMovie);

            // Re-enforce TMDB rating as source of truth after all sub-syncs
            savedMovie.setAggregateRating(movieDto.getVoteAverage());
            Movie finalSavedMovie = movieRepository.save(savedMovie);

            // Broadcast Notification if it's a completely new ingress
            if (isNewMovie) {
                try {
                    jdbcTemplate.update(
                        "INSERT INTO notifications (user_id, message, is_read, created_at) " +
                        "SELECT id, ?, false, CURRENT_TIMESTAMP FROM users",
                        "New Arrival: " + finalSavedMovie.getTitle() + " has entered the vault."
                    );
                    System.out.println("Broadcasted new arrival notification for: " + finalSavedMovie.getTitle());
                } catch (Exception e) {
                    System.err.println("Failed to broadcast notification: " + e.getMessage());
                }
            }

            return finalSavedMovie;

        } catch (Exception e) {
            System.err.println("Failed to sync movie " + tmdbId + ": " + e.getMessage());
            return null;
        }
    }

    private void syncCredits(Integer tmdbId, Movie movie) {
        String url = baseUrl + "/movie/" + tmdbId + "/credits?api_key=" + apiKey;
        try {
            ResponseEntity<TmdbCreditsDto> response = restTemplate.getForEntity(url, TmdbCreditsDto.class);
            TmdbCreditsDto creditsDto = response.getBody();
            if (creditsDto != null) {
                jdbcTemplate.update("DELETE FROM movie_cast WHERE movie_id = ?", movie.getId());
                jdbcTemplate.update("DELETE FROM movie_crew WHERE movie_id = ?", movie.getId());
                
                if (creditsDto.getCast() != null) {
                    for (int i = 0; i < Math.min(creditsDto.getCast().size(), 10); i++) {
                        TmdbCreditsDto.Cast c = creditsDto.getCast().get(i);
                        Long personId = upsertPerson(c.getId(), c.getName(), c.getProfilePath());
                        jdbcTemplate.update("INSERT INTO movie_cast (movie_id, person_id, character_name, character_type) VALUES (?, ?, ?, 'Actor')",
                            movie.getId(), personId, c.getCharacter());
                    }
                }
                
                if (creditsDto.getCrew() != null) {
                    for (TmdbCreditsDto.Crew c : creditsDto.getCrew()) {
                        if ("Director".equalsIgnoreCase(c.getJob())) {
                            Long personId = upsertPerson(c.getId(), c.getName(), c.getProfilePath());
                            jdbcTemplate.update("INSERT INTO movie_crew (movie_id, person_id, role_type) VALUES (?, ?, ?)",
                                movie.getId(), personId, c.getJob());
                        }
                    }
                }
            }
        } catch (Exception e) {}
    }

    private void syncTrailers(Integer tmdbId, Movie movie) {
        String url = baseUrl + "/movie/" + tmdbId + "/videos?api_key=" + apiKey;
        try {
            ResponseEntity<TmdbVideosDto> response = restTemplate.getForEntity(url, TmdbVideosDto.class);
            if (response.getBody() != null && response.getBody().getResults() != null) {
                for (TmdbVideosDto.Video v : response.getBody().getResults()) {
                    if ("Trailer".equalsIgnoreCase(v.getType()) && "YouTube".equalsIgnoreCase(v.getSite())) {
                        movie.setTrailerUrl("https://www.youtube.com/watch?v=" + v.getKey());
                        movieRepository.save(movie);
                        break;
                    }
                }
            }
        } catch (Exception e) {}
    }

    private void syncWatchProviders(Integer tmdbId, Movie movie) {
        String url = baseUrl + "/movie/" + tmdbId + "/watch/providers?api_key=" + apiKey;
        try {
            ResponseEntity<TmdbWatchProvidersDto> response = restTemplate.getForEntity(url, TmdbWatchProvidersDto.class);
            if (response.getBody() != null && response.getBody().getResults() != null) {
                TmdbWatchProvidersDto.CountryProviders india = response.getBody().getResults().get("IN");
                if (india != null && india.getFlatrate() != null) {
                    movie.getOttPlatforms().clear();
                    for (TmdbWatchProvidersDto.Provider p : india.getFlatrate()) {
                        String logoUrl = "https://image.tmdb.org/t/p/w92" + p.getLogoPath();
                        OttPlatform platform = ottPlatformRepository.findByTmdbProviderId(p.getProviderId())
                            .orElseGet(() -> new OttPlatform(p.getProviderId(), p.getProviderName(), logoUrl));
                        // Always update logo URL to use the correct size
                        platform.setLogoUrl(logoUrl);
                        platform.setName(p.getProviderName());
                        ottPlatformRepository.save(platform);
                        movie.getOttPlatforms().add(platform);
                    }
                    movieRepository.save(movie);
                }
            }
        } catch (Exception e) {}
    }

    private void syncAgeRating(Integer tmdbId, Movie movie) {
        String url = baseUrl + "/movie/" + tmdbId + "/release_dates?api_key=" + apiKey;
        try {
            ResponseEntity<TmdbReleaseDatesDto> response = restTemplate.getForEntity(url, TmdbReleaseDatesDto.class);
            if (response.getBody() != null && response.getBody().getResults() != null) {
                List<TmdbReleaseDatesDto.Result> results = response.getBody().getResults();
                
                // Priority 1: India (IN)
                String certificate = results.stream()
                        .filter(r -> "IN".equalsIgnoreCase(r.getIso31661()))
                        .flatMap(r -> r.getReleaseDates().stream())
                        .map(r -> r.getCertification())
                        .filter(c -> c != null && !c.isEmpty())
                        .findFirst()
                        .orElse(null);

                // Priority 2: USA (US) fallback
                if (certificate == null) {
                    certificate = results.stream()
                            .filter(r -> "US".equalsIgnoreCase(r.getIso31661()))
                            .flatMap(r -> r.getReleaseDates().stream())
                            .map(r -> r.getCertification())
                            .filter(c -> c != null && !c.isEmpty())
                            .findFirst()
                            .orElse(null);
                }

                if (certificate != null) {
                    movie.setAgeCertificate(certificate.trim());
                }
            }
        } catch (Exception e) {}
    }

    private void syncReviews(Integer tmdbId, Movie movie) {
        String url = baseUrl + "/movie/" + tmdbId + "/reviews?api_key=" + apiKey;
        try {
            ResponseEntity<TmdbReviewsDto> response = restTemplate.getForEntity(url, TmdbReviewsDto.class);
            if (response.getBody() != null && response.getBody().getResults() != null) {
                reviewRepository.deleteByMovie(movie);
                List<TmdbReviewsDto.Review> tmdbReviews = response.getBody().getResults();
                for (int i = 0; i < Math.min(tmdbReviews.size(), 5); i++) {
                    TmdbReviewsDto.Review r = tmdbReviews.get(i);
                    if (r.getContent() == null || r.getContent().isBlank()) continue;

                    UUID syncId = UUID.nameUUIDFromBytes(("TMDB_" + movie.getTmdbId() + "_" + r.getAuthor()).getBytes());

                    if (reviewRepository.findByMovieAndSessionId(movie, syncId).isPresent()) {
                        continue;
                    }

                    // Parse real rating from author_details (TMDB gives it out of 10)
                    int rating = 7; // neutral default if TMDB author didn't submit a score
                    if (r.getAuthorDetails() != null && r.getAuthorDetails().getRating() != null) {
                        double raw = r.getAuthorDetails().getRating();
                        // TMDB returns 1-10, our schema is also 1-10
                        rating = Math.max(1, Math.min(10, (int) Math.round(raw)));
                    }

                    // Parse real timestamp from TMDB
                    LocalDateTime reviewDate = LocalDateTime.now();
                    if (r.getCreatedAt() != null && !r.getCreatedAt().isEmpty()) {
                        try {
                            // TMDB format: 2023-11-04T13:11:39.695Z
                            reviewDate = LocalDateTime.parse(
                                r.getCreatedAt().replace("Z", "").substring(0, 19));
                        } catch (Exception ignored) {}
                    }

                    Review review = new Review();
                    review.setMovie(movie);
                    review.setSessionId(syncId);
                    review.setReviewTitle("Review by " + r.getAuthor());
                    review.setReviewBody(r.getContent());
                    review.setRating(rating);
                    review.setCreatedAt(reviewDate);
                    reviewRepository.save(review);
                }
                reviewRepository.flush();
            }
        } catch (Exception e) {}
    }
    
    private boolean isContentInappropriate(TmdbMovieDto movie) {
        String content = (movie.getTitle() + " " + movie.getOverview()).toLowerCase();
        return contentBlacklist.stream().anyMatch(word -> content.contains(" " + word + " ") || content.startsWith(word + " ") || content.endsWith(" " + word) || content.equals(word));
    }

    private Long upsertPerson(int tmdbId, String name, String profilePath) {
        String selectSql = "SELECT id FROM people WHERE tmdb_id = ?";
        List<Long> ids = jdbcTemplate.queryForList(selectSql, Long.class, tmdbId);
        
        String img = (profilePath != null) ? imageBaseUrl + profilePath : null;

        if (!ids.isEmpty()) {
            Long existingId = ids.get(0);
            // Always update to the latest TMDB truth (avoids "rubbish" legacy names)
            jdbcTemplate.update("UPDATE people SET name = ?, profile_photo_url = ? WHERE id = ?", name, img, existingId);
            return existingId;
        }
        
        String insertSql = "INSERT INTO people (tmdb_id, name, profile_photo_url) VALUES (?, ?, ?) RETURNING id";
        return jdbcTemplate.queryForObject(insertSql, Long.class, tmdbId, name, img);
    }

    public List<Movie> searchAndIngest(String query) {
        if (apiKey == null || apiKey.isEmpty()) return List.of();
        java.util.ArrayList<Movie> synced = new java.util.ArrayList<>();
        try {
            String url = baseUrl + "/search/movie?api_key=" + apiKey + "&query=" + query + "&include_adult=false";
            ResponseEntity<TmdbResponse<TmdbMovieDto>> response = restTemplate.exchange(
                url, HttpMethod.GET, null, new ParameterizedTypeReference<TmdbResponse<TmdbMovieDto>>() {}
            );
            if (response.getBody() != null && response.getBody().getResults() != null) {
                List<TmdbMovieDto> results = response.getBody().getResults();
                for (int i = 0; i < Math.min(results.size(), 3); i++) {
                    Movie m = syncMovieDetails(results.get(i).getId());
                    if (m != null) synced.add(m);
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to search and ingest: " + e.getMessage());
        }
        return synced;
    }

    public void cleanAdultMovies() {
        System.out.println("Starting adult movies cleanup...");
        List<Movie> allMovies = movieRepository.findAll();
        for (Movie m : allMovies) {
            if (m.getTmdbId() == null) continue;
            try {
                String detailsUrl = baseUrl + "/movie/" + m.getTmdbId() + "?api_key=" + apiKey;
                ResponseEntity<TmdbMovieDto> movieResponse = restTemplate.getForEntity(detailsUrl, TmdbMovieDto.class);
                TmdbMovieDto movieDto = movieResponse.getBody();
                if (movieDto != null && movieDto.isAdult()) {
                    System.out.println("Deleting adult movie: " + m.getTitle());
                    movieRepository.delete(m);
                }
            } catch (Exception e) {
                System.err.println("Failed to check movie " + m.getTitle() + ": " + e.getMessage());
            }
            // Sleep slightly to avoid hitting rate limits
            try { Thread.sleep(100); } catch (InterruptedException ignore) {}
        }
        System.out.println("Adult movies cleanup finished.");
    }
}
