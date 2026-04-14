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

    @Query(value = "SELECT * FROM movies WHERE title ILIKE CONCAT('%', :query, '%') OR synopsis ILIKE CONCAT('%', :query, '%')", nativeQuery = true)
    List<Movie> searchMovies(@Param("query") String query);

    @Query(value = "SELECT * FROM get_movie_recommendations(:movieId)", nativeQuery = true)
    List<Map<String, Object>> getRecommendations(@Param("movieId") Long movieId);

    @Query(value = "SELECT * FROM movies WHERE title ILIKE CONCAT('%', :query, '%') AND genres ILIKE CONCAT('%', :genre, '%')", nativeQuery = true)
    List<Movie> searchMoviesWithGenre(@Param("query") String query, @Param("genre") String genre);

    @Query(value = "SELECT * FROM movies WHERE genres ILIKE CONCAT('%', :genre, '%') ORDER BY aggregate_rating DESC NULLS LAST LIMIT 50", nativeQuery = true)
    List<Movie> findByGenre(@Param("genre") String genre);

    @Query(value = "SELECT * FROM movies WHERE release_date >= CURRENT_DATE - INTERVAL '1 year' ORDER BY aggregate_rating DESC NULLS LAST LIMIT 20", nativeQuery = true)
    List<Movie> findNewlyFeatured();

    @Query(value = "SELECT * FROM movies WHERE release_date >= CURRENT_DATE - INTERVAL '10 years' AND release_date < CURRENT_DATE - INTERVAL '1 year' ORDER BY aggregate_rating DESC NULLS LAST LIMIT 20", nativeQuery = true)
    List<Movie> findBestOfDecade();
}
