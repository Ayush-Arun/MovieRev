package com.cinevault.dto.tmdb;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class TmdbReleaseDatesDto {
    private List<Result> results;

    public List<Result> getResults() { return results; }
    public void setResults(List<Result> results) { this.results = results; }

    public static class Result {
        @JsonProperty("iso_3166_1")
        private String iso31661;
        
        @JsonProperty("release_dates")
        private List<ReleaseDateItem> releaseDates;

        public String getIso31661() { return iso31661; }
        public void setIso31661(String iso31661) { this.iso31661 = iso31661; }
        public List<ReleaseDateItem> getReleaseDates() { return releaseDates; }
        public void setReleaseDates(List<ReleaseDateItem> releaseDates) { this.releaseDates = releaseDates; }
    }

    public static class ReleaseDateItem {
        private String certification;
        private int type;

        public String getCertification() { return certification; }
        public void setCertification(String certification) { this.certification = certification; }
        public int getType() { return type; }
        public void setType(int type) { this.type = type; }
    }
}
