package com.cinevault.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "movie_id", nullable = false)
    private Movie movie;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "session_id")
    private UUID sessionId;

    @Column(nullable = false)
    private Integer rating;

    @Column(name = "review_title")
    private String reviewTitle;

    @Column(name = "review_body")
    private String reviewBody;

    private String sentiment;

    @Column(name = "helpful_votes")
    private Integer helpfulVotes = 0;

    @Column(name = "is_reported")
    private Boolean isReported = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public Review() {}

    public Review(Long id, Movie movie, User user, UUID sessionId, Integer rating, String reviewTitle, String reviewBody, String sentiment, Integer helpfulVotes, Boolean isReported, LocalDateTime createdAt) {
        this.id = id;
        this.movie = movie;
        this.user = user;
        this.sessionId = sessionId;
        this.rating = rating;
        this.reviewTitle = reviewTitle;
        this.reviewBody = reviewBody;
        this.sentiment = sentiment;
        this.helpfulVotes = helpfulVotes;
        this.isReported = isReported;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Movie getMovie() {
        return movie;
    }

    public void setMovie(Movie movie) {
        this.movie = movie;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public UUID getSessionId() {
        return sessionId;
    }

    public void setSessionId(UUID sessionId) {
        this.sessionId = sessionId;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getReviewTitle() {
        return reviewTitle;
    }

    public void setReviewTitle(String reviewTitle) {
        this.reviewTitle = reviewTitle;
    }

    public String getReviewBody() {
        return reviewBody;
    }

    public void setReviewBody(String reviewBody) {
        this.reviewBody = reviewBody;
    }

    public String getSentiment() {
        return sentiment;
    }

    public void setSentiment(String sentiment) {
        this.sentiment = sentiment;
    }

    public Integer getHelpfulVotes() {
        return helpfulVotes;
    }

    public void setHelpfulVotes(Integer helpfulVotes) {
        this.helpfulVotes = helpfulVotes;
    }

    public Boolean getIsReported() {
        return isReported;
    }

    public void setIsReported(Boolean isReported) {
        this.isReported = isReported;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

}
