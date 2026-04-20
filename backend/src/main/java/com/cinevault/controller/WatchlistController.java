package com.cinevault.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.Collections;

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
    public ResponseEntity<Map<String, Object>> checkInWatchlist(
            @RequestParam Long movieId,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String sessionId) {

        String sql;
        Object param;

        if (userId != null) {
            sql = "SELECT COUNT(*) FROM watchlist WHERE movie_id = ? AND user_id = ?";
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class, movieId, userId);
            return ResponseEntity.ok(Collections.singletonMap("archived", count != null && count > 0));
        } else if (sessionId != null) {
            sql = "SELECT COUNT(*) FROM watchlist WHERE movie_id = ? AND session_id = ?";
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class, movieId, UUID.fromString(sessionId));
            return ResponseEntity.ok(Collections.singletonMap("archived", count != null && count > 0));
        } else {
            return ResponseEntity.ok(Collections.singletonMap("archived", false));
        }
    }

    @PostMapping
    public ResponseEntity<?> addToWatchlist(@RequestBody Map<String, Object> body) {
        Integer movieId = (Integer) body.get("movieId");
        Object userIdObj = body.get("userId");
        Object sessionIdObj = body.get("sessionId");

        // Check for duplicates before inserting
        String checkSql = "SELECT COUNT(*) FROM watchlist WHERE movie_id = ? AND (";
        Object checkParam = null;
        if (userIdObj != null) {
            checkSql += "user_id = ?)";
            checkParam = userIdObj;
        } else if (sessionIdObj != null) {
            checkSql += "session_id = ?)";
            checkParam = UUID.fromString((String)sessionIdObj);
        } else {
            return ResponseEntity.badRequest().body("User or Session ID required");
        }

        Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, movieId, checkParam);
        if (count != null && count > 0) {
            return ResponseEntity.ok("Already in watchlist");
        }

        String sql = "INSERT INTO watchlist (movie_id, user_id, session_id) VALUES (?, ?, ?)";
        try {
            jdbcTemplate.update(sql, movieId, userIdObj,
                    sessionIdObj != null ? UUID.fromString((String)sessionIdObj) : null);
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
