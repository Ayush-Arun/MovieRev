package com.cinevault.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "movies")
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tmdb_id", unique = true)
    private Integer tmdbId;

    @Column(nullable = false)
    private String title;

    @Column(name = "original_language")
    private String originalLanguage;

    @Column(name = "release_date")
    private LocalDate releaseDate;

    private String synopsis;

    @Column(name = "poster_url")
    private String posterUrl;

    @Column(name = "trailer_url")
    private String trailerUrl;

    @Column(name = "age_certificate")
    private String ageCertificate;

    private String status;

    @Column(name = "runtime_minutes")
    private Integer runtimeMinutes;

    private String format;

    @Column(name = "production_house")
    private String productionHouse;

    private Long budget;

    @Column(name = "box_office")
    private Long boxOffice;

    @Column(name = "aggregate_rating")
    private Double aggregateRating;
    
    // search_vector omitted as it's handled completely by PG and shouldn't be read/written standardly

    public Movie() {}

    public Movie(Long id, Integer tmdbId, String title, String originalLanguage, LocalDate releaseDate, String synopsis, String posterUrl, String trailerUrl, String ageCertificate, String status, Integer runtimeMinutes, String format, String productionHouse, Long budget, Long boxOffice, Double aggregateRating) {
        this.id = id;
        this.tmdbId = tmdbId;
        this.title = title;
        this.originalLanguage = originalLanguage;
        this.releaseDate = releaseDate;
        this.synopsis = synopsis;
        this.posterUrl = posterUrl;
        this.trailerUrl = trailerUrl;
        this.ageCertificate = ageCertificate;
        this.status = status;
        this.runtimeMinutes = runtimeMinutes;
        this.format = format;
        this.productionHouse = productionHouse;
        this.budget = budget;
        this.boxOffice = boxOffice;
        this.aggregateRating = aggregateRating;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getTmdbId() {
        return tmdbId;
    }

    public void setTmdbId(Integer tmdbId) {
        this.tmdbId = tmdbId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getOriginalLanguage() {
        return originalLanguage;
    }

    public void setOriginalLanguage(String originalLanguage) {
        this.originalLanguage = originalLanguage;
    }

    public LocalDate getReleaseDate() {
        return releaseDate;
    }

    public void setReleaseDate(LocalDate releaseDate) {
        this.releaseDate = releaseDate;
    }

    public String getSynopsis() {
        return synopsis;
    }

    public void setSynopsis(String synopsis) {
        this.synopsis = synopsis;
    }

    public String getPosterUrl() {
        return posterUrl;
    }

    public void setPosterUrl(String posterUrl) {
        this.posterUrl = posterUrl;
    }

    public String getTrailerUrl() {
        return trailerUrl;
    }

    public void setTrailerUrl(String trailerUrl) {
        this.trailerUrl = trailerUrl;
    }

    public String getAgeCertificate() {
        return ageCertificate;
    }

    public void setAgeCertificate(String ageCertificate) {
        this.ageCertificate = ageCertificate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getRuntimeMinutes() {
        return runtimeMinutes;
    }

    public void setRuntimeMinutes(Integer runtimeMinutes) {
        this.runtimeMinutes = runtimeMinutes;
    }

    public String getFormat() {
        return format;
    }

    public void setFormat(String format) {
        this.format = format;
    }

    public String getProductionHouse() {
        return productionHouse;
    }

    public void setProductionHouse(String productionHouse) {
        this.productionHouse = productionHouse;
    }

    public Long getBudget() {
        return budget;
    }

    public void setBudget(Long budget) {
        this.budget = budget;
    }

    public Long getBoxOffice() {
        return boxOffice;
    }

    public void setBoxOffice(Long boxOffice) {
        this.boxOffice = boxOffice;
    }

    public Double getAggregateRating() {
        return aggregateRating;
    }

    public void setAggregateRating(Double aggregateRating) {
        this.aggregateRating = aggregateRating;
    }

}
