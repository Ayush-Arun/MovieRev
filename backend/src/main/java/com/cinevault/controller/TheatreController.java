package com.cinevault.controller;

import com.cinevault.entity.Theatre;
import com.cinevault.repository.TheatreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/theatres")
public class TheatreController {

    @Autowired
    private TheatreRepository theatreRepository;

    @GetMapping("/cities")
    public ResponseEntity<List<String>> getCities() {
        return ResponseEntity.ok(theatreRepository.findDistinctCities());
    }

    @GetMapping
    public ResponseEntity<List<Theatre>> getTheatres(@RequestParam String city) {
        return ResponseEntity.ok(theatreRepository.findByCity(city));
    }
}
