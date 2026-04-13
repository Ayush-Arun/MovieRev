package com.cinevault.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "people")
public class Person {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tmdb_id", unique = true)
    private Integer tmdbId;

    @Column(nullable = false)
    private String name;

    @Column(name = "profile_photo_url")
    private String profilePhotoUrl;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    private String nationality;

    private String biography;

    public Person() {}

    public Person(Long id, Integer tmdbId, String name, String profilePhotoUrl, LocalDate birthDate, String nationality, String biography) {
        this.id = id;
        this.tmdbId = tmdbId;
        this.name = name;
        this.profilePhotoUrl = profilePhotoUrl;
        this.birthDate = birthDate;
        this.nationality = nationality;
        this.biography = biography;
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getProfilePhotoUrl() {
        return profilePhotoUrl;
    }

    public void setProfilePhotoUrl(String profilePhotoUrl) {
        this.profilePhotoUrl = profilePhotoUrl;
    }

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(LocalDate birthDate) {
        this.birthDate = birthDate;
    }

    public String getNationality() {
        return nationality;
    }

    public void setNationality(String nationality) {
        this.nationality = nationality;
    }

    public String getBiography() {
        return biography;
    }

    public void setBiography(String biography) {
        this.biography = biography;
    }

}
