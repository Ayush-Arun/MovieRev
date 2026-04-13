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

        public String getAuthor() { return author; }
        public void setAuthor(String author) { this.author = author; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }
}
