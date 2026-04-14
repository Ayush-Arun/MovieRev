package com.cinevault.repository;

import com.cinevault.entity.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

import java.util.Optional;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {
    Optional<Movie> findByTmdbId(Integer tmdbId);

    @Query("SELECT DISTINCT m FROM Movie m LEFT JOIN FETCH m.genres g WHERE LOWER(m.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(m.synopsis) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Movie> searchMovies(@Param("query") String query);

    @Query(value = "SELECT * FROM movies m WHERE similarity(m.title, :query) > 0.3 ORDER BY similarity(m.title, :query) DESC LIMIT 10", nativeQuery = true)
    List<Movie> fuzzySearchMovies(@Param("query") String query);

    @Query(value = "SELECT * FROM get_movie_recommendations(:movieId)", nativeQuery = true)
    List<Map<String, Object>> getRecommendations(@Param("movieId") Long movieId);

    @Query("SELECT DISTINCT m FROM Movie m JOIN FETCH m.genres g WHERE (LOWER(m.title) LIKE LOWER(CONCAT('%', :query, '%'))) AND g.name = :genre")
    List<Movie> searchMoviesWithGenre(@Param("query") String query, @Param("genre") String genre);

    @Query("SELECT DISTINCT m FROM Movie m LEFT JOIN FETCH m.genres g WHERE g.name = :genre AND (m.ageCertificate IS NULL OR m.ageCertificate NOT IN ('A', 'R', 'NC-17', 'NR')) ORDER BY m.aggregateRating DESC")
    List<Movie> findByGenre(@Param("genre") String genre);

    @Query("SELECT DISTINCT m FROM Movie m LEFT JOIN FETCH m.genres g WHERE m.releaseDate >= :since AND (m.ageCertificate IS NULL OR m.ageCertificate NOT IN ('A', 'R', 'NC-17', 'NR')) AND m.posterUrl IS NOT NULL ORDER BY m.aggregateRating DESC")
    List<Movie> findNewlyFeatured(@Param("since") java.time.LocalDate since);

    @Query("SELECT DISTINCT m FROM Movie m LEFT JOIN FETCH m.genres g WHERE m.releaseDate BETWEEN :start AND :end AND (m.ageCertificate IS NULL OR m.ageCertificate NOT IN ('A', 'R', 'NC-17', 'NR')) AND m.posterUrl IS NOT NULL ORDER BY m.aggregateRating DESC")
    List<Movie> findBestOfDecade(@Param("start") java.time.LocalDate start, @Param("end") java.time.LocalDate end);

    @Query("SELECT DISTINCT m FROM Movie m LEFT JOIN FETCH m.genres g WHERE m.releaseDate BETWEEN :start AND :end AND (m.ageCertificate IS NULL OR m.ageCertificate NOT IN ('A', 'R', 'NC-17', 'NR')) AND m.posterUrl IS NOT NULL ORDER BY m.releaseDate DESC")
    List<Movie> findNowPlaying(@Param("start") java.time.LocalDate start, @Param("end") java.time.LocalDate end);
}
