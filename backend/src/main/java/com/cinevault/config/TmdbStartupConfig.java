package com.cinevault.config;

import com.cinevault.service.TmdbSyncService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TmdbStartupConfig {

    @Bean
    public CommandLineRunner runSyncOnStartup(TmdbSyncService tmdbSyncService) {
        return args -> {
            System.out.println("======================================================");
            System.out.println("INITIALIZING AUTOMATED TMDB SYNC ON STARTUP...");
            try {
                tmdbSyncService.cleanAdultMovies();
                tmdbSyncService.syncHollywoodMovies();
                tmdbSyncService.syncBollywoodMovies();
                tmdbSyncService.syncSouthIndianMovies();
                System.out.println("TMDB SYNC SUCCESSFUL! DATABASE POPULATED.");;
            } catch (Exception e) {
                System.err.println("TMDB SYNC FAILED: " + e.getMessage());
            }
            System.out.println("======================================================");
        };
    }
}
