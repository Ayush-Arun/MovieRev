package com.cinevault.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "theatres")
public class Theatre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String city;

    private String state;

    @Column(name = "supported_formats")
    private String supportedFormats;

    public Theatre() {}

    public Theatre(Long id, String name, String city, String state, String supportedFormats) {
        this.id = id;
        this.name = name;
        this.city = city;
        this.state = state;
        this.supportedFormats = supportedFormats;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getSupportedFormats() {
        return supportedFormats;
    }

    public void setSupportedFormats(String supportedFormats) {
        this.supportedFormats = supportedFormats;
    }

}
