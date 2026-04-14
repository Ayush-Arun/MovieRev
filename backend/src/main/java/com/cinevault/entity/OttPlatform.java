package com.cinevault.entity;

import jakarta.persistence.*;
import java.util.Set;
import java.util.HashSet;

@Entity
@Table(name = "ott_platforms")
public class OttPlatform {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tmdb_provider_id", unique = true)
    private Integer tmdbProviderId;

    @Column(nullable = false)
    private String name;

    @Column(name = "logo_url")
    private String logoUrl;

    public OttPlatform() {}

    public OttPlatform(Integer tmdbProviderId, String name, String logoUrl) {
        this.tmdbProviderId = tmdbProviderId;
        this.name = name;
        this.logoUrl = logoUrl;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getTmdbProviderId() {
        return tmdbProviderId;
    }

    public void setTmdbProviderId(Integer tmdbProviderId) {
        this.tmdbProviderId = tmdbProviderId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }
}
