package com.cinevault.service;

import com.cinevault.dto.tmdb.TmdbCreditsDto;
import com.cinevault.dto.tmdb.TmdbMovieDto;
import com.cinevault.dto.tmdb.TmdbResponse;
import com.cinevault.entity.Movie;
import com.cinevault.repository.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
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
    private JdbcTemplate jdbcTemplate;

    private final RestTemplate restTemplate = new RestTemplate();

    private static final Map<Integer, String> GENRE_MAP = new HashMap<>();
    static {
        GENRE_MAP.put(28, "Action");
        GENRE_MAP.put(12, "Adventure");
        GENRE_MAP.put(16, "Animation");
        GENRE_MAP.put(35, "Comedy");
        GENRE_MAP.put(80, "Crime");
        GENRE_MAP.put(99, "Documentary");
        GENRE_MAP.put(18, "Drama");
        GENRE_MAP.put(10751, "Family");
        GENRE_MAP.put(14, "Fantasy");
        GENRE_MAP.put(36, "History");
        GENRE_MAP.put(27, "Horror");
        GENRE_MAP.put(10402, "Music");
        GENRE_MAP.put(9648, "Mystery");
        GENRE_MAP.put(10749, "Romance");
        GENRE_MAP.put(878, "Science Fiction");
        GENRE_MAP.put(10770, "TV Movie");
        GENRE_MAP.put(53, "Thriller");
        GENRE_MAP.put(10752, "War");
        GENRE_MAP.put(37, "Western");
    }

    private String mapGenres(List<Integer> genreIds) {
        if (genreIds == null || genreIds.isEmpty()) return null;
        return genreIds.stream()
            .map(id -> GENRE_MAP.getOrDefault(id, "Unknown"))
            .filter(g -> !"Unknown".equals(g))
            .collect(Collectors.joining(", "));
    }

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
    public void syncMovieDetails(Integer tmdbId) {
        if (apiKey == null || apiKey.isEmpty()) {
            System.err.println("TMDB API Key missing, skipping sync.");
            return;
        }

        String detailsUrl = baseUrl + "/movie/" + tmdbId + "?api_key=" + apiKey;
        String creditsUrl = baseUrl + "/movie/" + tmdbId + "/credits?api_key=" + apiKey;
        String reviewsUrl = baseUrl + "/movie/" + tmdbId + "/reviews?api_key=" + apiKey;
        
        try {
            // Fetch Movie Details
            ResponseEntity<TmdbMovieDto> movieResponse = restTemplate.getForEntity(detailsUrl, TmdbMovieDto.class);
            TmdbMovieDto movieDto = movieResponse.getBody();
            if (movieDto == null) return;
            
            // Save or Update Movie
            Movie movie = movieRepository.findByTmdbId(tmdbId).orElse(new Movie());
            if (movieDto.isAdult()) {
                System.out.println("Skipping/removing adult movie: " + movieDto.getTitle());
                if (movie.getId() != null) {
                    movieRepository.delete(movie);
                }
                return;
            }
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
            if (movieDto.getGenreIds() != null) {
                movie.setGenres(mapGenres(movieDto.getGenreIds()));
            }
            if (movieDto.getRuntime() != null && movieDto.getRuntime() > 0) {
                movie.setRuntimeMinutes(movieDto.getRuntime());
            } else {
                movie.setRuntimeMinutes(null);
            }
            
            Movie savedMovie = movieRepository.save(movie);

            // Fetch Credits
            try {
                ResponseEntity<TmdbCreditsDto> creditsResponse = restTemplate.getForEntity(creditsUrl, TmdbCreditsDto.class);
                TmdbCreditsDto creditsDto = creditsResponse.getBody();
                if (creditsDto != null) {
                    jdbcTemplate.update("DELETE FROM movie_cast WHERE movie_id = ?", savedMovie.getId());
                    jdbcTemplate.update("DELETE FROM movie_crew WHERE movie_id = ?", savedMovie.getId());
                    
                    if (creditsDto.getCast() != null) {
                        for (int i = 0; i < Math.min(creditsDto.getCast().size(), 10); i++) {
                            TmdbCreditsDto.Cast c = creditsDto.getCast().get(i);
                            Long personId = upsertPerson(c.getId(), c.getName(), c.getProfilePath());
                            jdbcTemplate.update("INSERT INTO movie_cast (movie_id, person_id, character_name, character_type) VALUES (?, ?, ?, 'Actor')",
                                savedMovie.getId(), personId, c.getCharacter());
                        }
                    }
                    
                    if (creditsDto.getCrew() != null) {
                        for (TmdbCreditsDto.Crew c : creditsDto.getCrew()) {
                            if ("Director".equalsIgnoreCase(c.getJob())) {
                                Long personId = upsertPerson(c.getId(), c.getName(), c.getProfilePath());
                                jdbcTemplate.update("INSERT INTO movie_crew (movie_id, person_id, role_type) VALUES (?, ?, ?)",
                                    savedMovie.getId(), personId, c.getJob());
                            }
                        }
                    }
                }
            } catch (Exception e) {}

            // Fetch Reviews
            try {
                ResponseEntity<com.cinevault.dto.tmdb.TmdbReviewsDto> reviewsResponse = restTemplate.getForEntity(reviewsUrl, com.cinevault.dto.tmdb.TmdbReviewsDto.class);
                com.cinevault.dto.tmdb.TmdbReviewsDto reviewsDto = reviewsResponse.getBody();
                if (reviewsDto != null && reviewsDto.getResults() != null) {
                    jdbcTemplate.update("DELETE FROM reviews WHERE movie_id = ?", savedMovie.getId());
                    for (int i = 0; i < Math.min(reviewsDto.getResults().size(), 5); i++) {
                        com.cinevault.dto.tmdb.TmdbReviewsDto.Review r = reviewsDto.getResults().get(i);
                        String title = "Review by " + r.getAuthor();
                        String content = r.getContent();
                        if (content != null && content.length() > 1000) content = content.substring(0, 1000) + "...";
                        
                        jdbcTemplate.update("INSERT INTO reviews (movie_id, session_id, rating, review_title, review_body) VALUES (?, ?, ?, ?, ?)",
                            savedMovie.getId(), java.util.UUID.randomUUID(), 8, title, content);
                    }
                }
            } catch (Exception e) {}

        } catch (Exception e) {
            System.err.println("Failed to sync movie " + tmdbId + ": " + e.getMessage());
        }
    }
    
    private Long upsertPerson(int tmdbId, String name, String profilePath) {
        String selectSql = "SELECT id FROM people WHERE tmdb_id = ?";
        List<Long> ids = jdbcTemplate.queryForList(selectSql, Long.class, tmdbId);
        if (!ids.isEmpty()) {
            return ids.get(0);
        }
        
        String img = (profilePath != null) ? imageBaseUrl + profilePath : null;
        String insertSql = "INSERT INTO people (tmdb_id, name, profile_photo_url) VALUES (?, ?, ?) RETURNING id";
        return jdbcTemplate.queryForObject(insertSql, Long.class, tmdbId, name, img);
    }

    public void searchAndIngest(String query) {
        if (apiKey == null || apiKey.isEmpty()) return;
        try {
            String url = baseUrl + "/search/movie?api_key=" + apiKey + "&query=" + query + "&include_adult=false";
            ResponseEntity<TmdbResponse<TmdbMovieDto>> response = restTemplate.exchange(
                url, HttpMethod.GET, null, new ParameterizedTypeReference<TmdbResponse<TmdbMovieDto>>() {}
            );
            if (response.getBody() != null && response.getBody().getResults() != null) {
                List<TmdbMovieDto> results = response.getBody().getResults();
                for (int i = 0; i < Math.min(results.size(), 5); i++) {
                    syncMovieDetails(results.get(i).getId());
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to search and ingest: " + e.getMessage());
        }
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
