package com.cinevault.repository;

import com.cinevault.entity.Theatre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TheatreRepository extends JpaRepository<Theatre, Long> {
    List<Theatre> findByCity(String city);
    
    @Query("SELECT DISTINCT t.city FROM Theatre t ORDER BY t.city")
    List<String> findDistinctCities();
}
