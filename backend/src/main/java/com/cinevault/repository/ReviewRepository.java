package com.cinevault.repository;

import com.cinevault.entity.Review;
import com.cinevault.entity.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByMovie(Movie movie);
    Optional<Review> findByMovieAndSessionId(Movie movie, UUID sessionId);
    void deleteByMovie(Movie movie);
}
