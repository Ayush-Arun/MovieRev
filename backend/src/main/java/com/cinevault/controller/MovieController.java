package com.cinevault.controller;

import com.cinevault.entity.Movie;
import com.cinevault.repository.MovieRepository;
import com.cinevault.service.TmdbSyncService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/movies")
public class MovieController {

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private TmdbSyncService tmdbSyncService;

    @GetMapping
    public ResponseEntity<List<Movie>> getAllMovies() {
        return ResponseEntity.ok(movieRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Movie> getMovie(@PathVariable Long id) {
        return movieRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Movie>> searchMovies(@RequestParam String q, @RequestParam(required = false) String genre) {
        tmdbSyncService.searchAndIngest(q);
        if (genre != null && !genre.isEmpty()) {
            return ResponseEntity.ok(movieRepository.searchMoviesWithGenre(q, genre));
        }
        return ResponseEntity.ok(movieRepository.searchMovies(q));
    }

    @GetMapping("/featured")
    public ResponseEntity<List<Movie>> getFeaturedMovies() {
        java.time.LocalDate since = java.time.LocalDate.now().minusYears(1);
        return ResponseEntity.ok(movieRepository.findNewlyFeatured(since));
    }

    @GetMapping("/decade")
    public ResponseEntity<List<Movie>> getDecadeMovies() {
        java.time.LocalDate start = java.time.LocalDate.now().minusYears(10);
        java.time.LocalDate end = java.time.LocalDate.now().minusYears(1);
        return ResponseEntity.ok(movieRepository.findBestOfDecade(start, end));
    }

    @GetMapping("/now-playing")
    public ResponseEntity<List<Movie>> getNowPlaying() {
        java.time.LocalDate start = java.time.LocalDate.now().minusMonths(1);
        java.time.LocalDate end = java.time.LocalDate.now().plusMonths(1);
        return ResponseEntity.ok(movieRepository.findNowPlaying(start, end));
    }

    @GetMapping("/browse")
    public ResponseEntity<List<Movie>> browseMovies(@RequestParam(required = false) String genre) {
        if (genre != null && !genre.isEmpty()) {
            return ResponseEntity.ok(movieRepository.findByGenre(genre));
        }
        return ResponseEntity.ok(movieRepository.findAll());
    }

    @GetMapping("/{id}/recommendations")
    public ResponseEntity<List<Map<String, Object>>> getRecommendations(@PathVariable Long id) {
        return ResponseEntity.ok(movieRepository.getRecommendations(id));
    }

    @GetMapping("/{id}/cast")
    public ResponseEntity<List<Map<String, Object>>> getCast(@PathVariable Long id) {
        String sql = "SELECT * FROM view_movie_full_cast WHERE movie_id = ?";
        return ResponseEntity.ok(jdbcTemplate.queryForList(sql, id));
    }

    @GetMapping("/{id}/reviews")
    public ResponseEntity<List<Map<String, Object>>> getReviews(@PathVariable Long id) {
        String sql = "SELECT * FROM reviews WHERE movie_id = ? ORDER BY created_at DESC";
        return ResponseEntity.ok(jdbcTemplate.queryForList(sql, id));
    }
}
