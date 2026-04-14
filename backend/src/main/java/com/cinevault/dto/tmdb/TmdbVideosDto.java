package com.cinevault.dto.tmdb;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class TmdbVideosDto {
    private List<Video> results;

    public List<Video> getResults() { return results; }
    public void setResults(List<Video> results) { this.results = results; }

    public static class Video {
        private String key;
        private String site;
        private String type;
        private boolean official;

        public String getKey() { return key; }
        public void setKey(String key) { this.key = key; }
        public String getSite() { return site; }
        public void setSite(String site) { this.site = site; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public boolean isOfficial() { return official; }
        public void setOfficial(boolean official) { this.official = official; }
    }
}
