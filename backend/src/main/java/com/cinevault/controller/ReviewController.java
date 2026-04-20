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

    @GetMapping("/stats")
    public ResponseEntity<?> getUserStats(@RequestParam(required = false) Long userId, @RequestParam(required = false) String sessionId) {
        if (userId == null && sessionId == null) return ResponseEntity.badRequest().body("Must provide userId or sessionId");
        String sql;
        Object param;
        if (userId != null) {
            sql = "SELECT COUNT(*) as total_reviews, COALESCE(AVG(rating), 0) as avg_rating FROM reviews WHERE user_id = ?";
            param = userId;
        } else {
            sql = "SELECT COUNT(*) as total_reviews, COALESCE(AVG(rating), 0) as avg_rating FROM reviews WHERE session_id = ?";
            param = UUID.fromString(sessionId);
        }
        try {
            Map<String, Object> stats = jdbcTemplate.queryForMap(sql, param);
            return ResponseEntity.ok(Map.of(
                "totalReviews", ((Number) stats.get("total_reviews")).intValue(),
                "avgRating", Math.round(((Number) stats.get("avg_rating")).doubleValue() * 10.0) / 10.0
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get stats: " + e.getMessage());
        }
    }
}
