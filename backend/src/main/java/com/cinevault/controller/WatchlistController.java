package com.cinevault.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/watchlist")
public class WatchlistController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getWatchlist(@RequestParam(required = false) Long userId,
                                                                  @RequestParam(required = false) String sessionId) {
        String sql = "SELECT w.*, m.title, m.poster_url FROM watchlist w JOIN movies m ON w.movie_id = m.id WHERE ";
        Object param = null;

        if (userId != null) {
            sql += "w.user_id = ?";
            param = userId;
        } else if (sessionId != null) {
            sql += "w.session_id = ?";
            param = UUID.fromString(sessionId);
        } else {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(jdbcTemplate.queryForList(sql, param));
    }

    @GetMapping("/check")
    public ResponseEntity<Boolean> checkInWatchlist(@RequestParam Long movieId,
                                                   @RequestParam(required = false) Long userId,
                                                   @RequestParam(required = false) String sessionId) {
        if (userId != null && sessionId != null) {
            // Check both user-owned AND any lingering guest session entry (handles failed merge scenario)
            String sql = "SELECT COUNT(*) FROM watchlist WHERE movie_id = ? AND (user_id = ? OR session_id = ?)";
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class, movieId, userId, UUID.fromString(sessionId));
            return ResponseEntity.ok(count != null && count > 0);
        } else if (userId != null) {
            Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM watchlist WHERE movie_id = ? AND user_id = ?", Integer.class, movieId, userId);
            return ResponseEntity.ok(count != null && count > 0);
        } else if (sessionId != null) {
            Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM watchlist WHERE movie_id = ? AND session_id = ?", Integer.class, movieId, UUID.fromString(sessionId));
            return ResponseEntity.ok(count != null && count > 0);
        } else {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> addToWatchlist(@RequestBody Map<String, Object> body) {
        Integer movieId = (Integer) body.get("movieId");
        Object userIdObj = body.get("userId");
        Object sessionIdObj = body.get("sessionId");

        if (userIdObj == null && sessionIdObj == null) {
            return ResponseEntity.badRequest().body("User or Session ID required");
        }

        if (userIdObj != null) {
            // Logged-in user: first clean up any stale guest entry for this movie+session (failed merge)
            if (sessionIdObj != null) {
                try {
                    jdbcTemplate.update("DELETE FROM watchlist WHERE movie_id = ? AND session_id = ? AND user_id IS NULL",
                            movieId, UUID.fromString((String) sessionIdObj));
                } catch (Exception ignored) {}
            }
            // Check if this user already has this movie
            Integer userCount = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM watchlist WHERE movie_id = ? AND user_id = ?",
                    Integer.class, movieId, userIdObj);
            if (userCount != null && userCount > 0) {
                return ResponseEntity.ok("Already in watchlist");
            }
        } else {
            // Guest user: check for session duplicate
            Integer sessCount = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM watchlist WHERE movie_id = ? AND session_id = ?",
                    Integer.class, movieId, UUID.fromString((String) sessionIdObj));
            if (sessCount != null && sessCount > 0) {
                return ResponseEntity.ok("Already in watchlist");
            }
        }

        String sql = "INSERT INTO watchlist (movie_id, user_id, session_id) VALUES (?, ?, ?)";
        try {
            jdbcTemplate.update(sql, movieId, userIdObj,
                    sessionIdObj != null ? UUID.fromString((String) sessionIdObj) : null);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> removeFromWatchlist(@PathVariable Long id) {
        jdbcTemplate.update("DELETE FROM watchlist WHERE id = ?", id);
        return ResponseEntity.ok().build();
    }
}
