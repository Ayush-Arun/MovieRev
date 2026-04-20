package com.cinevault.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostMapping
    public ResponseEntity<?> addReview(@RequestBody Map<String, Object> body) {
        Integer movieId = (Integer) body.get("movieId");
        Integer rating = (Integer) body.get("rating");
        String title = (String) body.get("reviewTitle");
        String reviewBody = (String) body.get("reviewBody");
        Object userIdObj = body.get("userId");
        Object sessionIdObj = body.get("sessionId");

        if (userIdObj != null) {
            try {
                java.time.LocalDateTime createdAt = jdbcTemplate.queryForObject(
                    "SELECT created_at FROM users WHERE id = ?", java.time.LocalDateTime.class, userIdObj);
                if (createdAt != null && createdAt.isAfter(java.time.LocalDateTime.now().minusDays(1))) {
                    return ResponseEntity.badRequest().body("Accounts must be at least 24 hours old to post reviews. This prevents bot spam.");
                }
            } catch (Exception e) {
                // Ignore DB read failure, allow processing to continue or log
            }
        }

        String sql = "INSERT INTO reviews (movie_id, user_id, session_id, rating, review_title, review_body) VALUES (?, ?, ?, ?, ?, ?)";
        
        try {
            jdbcTemplate.update(sql, movieId, userIdObj, 
                                sessionIdObj != null ? UUID.fromString((String)sessionIdObj) : null, 
                                rating, title, reviewBody);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to add review: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable Long id) {
        jdbcTemplate.update("DELETE FROM reviews WHERE id = ?", id);
        return ResponseEntity.ok().build();
    }
}
