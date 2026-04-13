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
}
