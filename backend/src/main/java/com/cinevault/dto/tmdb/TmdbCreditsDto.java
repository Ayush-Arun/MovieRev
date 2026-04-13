package com.cinevault.dto.tmdb;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class TmdbCreditsDto {
    private int id;
    private List<Cast> cast;
    private List<Crew> crew;

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public List<Cast> getCast() { return cast; }
    public void setCast(List<Cast> cast) { this.cast = cast; }
    public List<Crew> getCrew() { return crew; }
    public void setCrew(List<Crew> crew) { this.crew = crew; }

    public static class Cast {
        private int id;
        private String name;
        private String character;
        
        @JsonProperty("profile_path")
        private String profilePath;

        public int getId() { return id; }
        public void setId(int id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getCharacter() { return character; }
        public void setCharacter(String character) { this.character = character; }
        public String getProfilePath() { return profilePath; }
        public void setProfilePath(String profilePath) { this.profilePath = profilePath; }
    }

    public static class Crew {
        private int id;
        private String name;
        private String job;
        
        @JsonProperty("profile_path")
        private String profilePath;

        public int getId() { return id; }
        public void setId(int id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getJob() { return job; }
        public void setJob(String job) { this.job = job; }
        public String getProfilePath() { return profilePath; }
        public void setProfilePath(String profilePath) { this.profilePath = profilePath; }
    }
}
