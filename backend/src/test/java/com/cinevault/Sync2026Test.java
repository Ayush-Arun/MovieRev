package com.cinevault;

import com.cinevault.entity.Movie;
import com.cinevault.repository.MovieRepository;
import com.cinevault.service.TmdbSyncService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestPropertySource(properties = "app.tmdb.sync-on-startup=false")
public class Sync2026Test {

    @Autowired
    private TmdbSyncService tmdbSyncService;

    @Autowired
    private MovieRepository movieRepository;

    @Test
    public void testSync2026Movie() {
        // Test syncing a 2026 movie: Heart of the Beast (TMDB ID: 1263337)
        Movie movie = tmdbSyncService.syncMovieDetails(1263337);
        assertNotNull(movie, "Synced movie should not be null");
        assertEquals(1263337, movie.getTmdbId());
        assertNotNull(movie.getReleaseDate(), "Release date should be populated");
        assertEquals(2026, movie.getReleaseDate().getYear(), "Movie release year should be 2026");
        
        Optional<Movie> found = movieRepository.findByTmdbId(1263337);
        assertTrue(found.isPresent(), "Movie should be persisted in database");
        System.out.println(">>> Verified 2026 movie sync: " + found.get().getTitle() + " (" + found.get().getReleaseDate() + ")");
    }
}
