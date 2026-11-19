package com.cinevault.controller;

import com.cinevault.entity.User;
import com.cinevault.repository.UserRepository;
import com.cinevault.service.TmdbSyncService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminController {

    @Autowired
    private TmdbSyncService tmdbSyncService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/sync/current-year")
    public ResponseEntity<?> syncCurrentYear() {
        new Thread(() -> tmdbSyncService.syncCurrentYearMovies()).start();
        return ResponseEntity.ok("Current year (2026) movie sync started in background.");
    }

    @PostMapping("/sync/now-playing")
    public ResponseEntity<?> syncNowPlaying() {
        new Thread(() -> tmdbSyncService.syncNowPlayingMovies()).start();
        return ResponseEntity.ok("Now playing movie sync started in background.");
    }

    @PostMapping("/sync/hollywood")
    public ResponseEntity<?> syncHollywood() {
        new Thread(() -> tmdbSyncService.syncHollywoodMovies()).start();
        return ResponseEntity.ok("Hollywood sync started in background.");
    }

    @PostMapping("/sync/decade")
    public ResponseEntity<?> syncDecade() {
        new Thread(() -> tmdbSyncService.syncDecadeMovies()).start();
        return ResponseEntity.ok("Decade movie sync started in background.");
    }

    @PostMapping("/sync/bollywood")
    public ResponseEntity<?> syncBollywood() {
        new Thread(() -> tmdbSyncService.syncBollywoodMovies()).start();
        return ResponseEntity.ok("Bollywood sync triggered.");
    }

    @PostMapping("/sync/south-indian")
    public ResponseEntity<?> syncSouthIndian() {
        new Thread(() -> tmdbSyncService.syncSouthIndianMovies()).start();
        return ResponseEntity.ok("South Indian sync triggered.");
    }

    @PostMapping("/sync/movie/{tmdbId}")
    public ResponseEntity<?> syncMovie(@PathVariable Integer tmdbId) {
        tmdbSyncService.syncMovieDetails(tmdbId);
        return ResponseEntity.ok("Movie sync triggered.");
    }

    @PostMapping("/clean-adult-movies")
    public ResponseEntity<?> cleanAdultMovies() {
        new Thread(() -> tmdbSyncService.cleanAdultMovies()).start();
        return ResponseEntity.ok("Adult movies cleanup started in background.");
    }

    @GetMapping("/users")
    public ResponseEntity<?> getUsers() {
        List<User> users = userRepository.findAll();
        // Mask passwords before returning or use DTOs
        users.forEach(u -> u.setPasswordHash(null));
        return ResponseEntity.ok(users);
    }
}
