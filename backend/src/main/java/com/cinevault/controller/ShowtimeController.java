package com.cinevault.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/showtimes")
public class ShowtimeController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getShowtimes(@RequestParam(required = false) Long movieId,
                                                                  @RequestParam(required = false) String city,
                                                                  @RequestParam(required = false) String date) {
        StringBuilder sql = new StringBuilder(
            "SELECT s.*, t.name as theatre_name, t.city, m.title as movie_title, m.poster_url " +
            "FROM showtimes s " +
            "JOIN theatres t ON s.theatre_id = t.id " +
            "JOIN movies m ON s.movie_id = m.id " +
            "WHERE 1=1"
        );
        
        if (movieId != null) sql.append(" AND s.movie_id = ").append(movieId);
        if (city != null && !city.isEmpty()) sql.append(" AND t.city = '").append(city).append("'");
        if (date != null && !date.isEmpty()) sql.append(" AND s.show_date = '").append(date).append("'");
        else sql.append(" AND s.show_date = CURRENT_DATE");

        sql.append(" ORDER BY s.show_time ASC");
        
        return ResponseEntity.ok(jdbcTemplate.queryForList(sql.toString()));
    }

    @PostMapping("/book")
    public ResponseEntity<?> bookSeats(@RequestBody Map<String, Object> body) {
        Integer showtimeId = (Integer) body.get("showtimeId");
        Integer seats = (Integer) body.get("seats");

        try {
            // Trigger 4 handles validation
            jdbcTemplate.update("UPDATE showtimes SET available_seats = available_seats - ? WHERE id = ?", seats, showtimeId);
            jdbcTemplate.update("INSERT INTO seat_booking_log (showtime_id, seats_booked) VALUES (?, ?)", showtimeId, seats);
            return ResponseEntity.ok("Booking successful");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Booking failed: " + e.getMessage());
        }
    }
}
