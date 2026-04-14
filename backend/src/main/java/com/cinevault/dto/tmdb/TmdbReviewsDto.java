package com.cinevault.dto.tmdb;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class TmdbReviewsDto {
    private List<Review> results;

    public List<Review> getResults() { return results; }
    public void setResults(List<Review> results) { this.results = results; }

    public static class Review {
        private String author;
        private String content;

        @JsonProperty("created_at")
        private String createdAt;

        @JsonProperty("author_details")
        private AuthorDetails authorDetails;

        public String getAuthor() { return author; }
        public void setAuthor(String author) { this.author = author; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
        public AuthorDetails getAuthorDetails() { return authorDetails; }
        public void setAuthorDetails(AuthorDetails authorDetails) { this.authorDetails = authorDetails; }
    }

    public static class AuthorDetails {
        private Double rating;

        public Double getRating() { return rating; }
        public void setRating(Double rating) { this.rating = rating; }
    }
}
