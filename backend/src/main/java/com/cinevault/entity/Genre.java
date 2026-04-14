package com.cinevault.entity;

import jakarta.persistence.*;
import java.util.Set;
import java.util.HashSet;

@Entity
@Table(name = "genres")
public class Genre {

    @Id
    private Integer id; // Using TMDB Genre ID

    @Column(nullable = false, unique = true)
    private String name;

    public Genre() {}

    public Genre(Integer id, String name) {
        this.id = id;
        this.name = name;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
