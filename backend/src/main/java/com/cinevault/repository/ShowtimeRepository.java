package com.cinevault.repository;

import com.cinevault.entity.Showtime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {
    List<Showtime> findByMovieIdAndShowDate(Long movieId, LocalDate showDate);
    List<Showtime> findByTheatreIdAndShowDate(Long theatreId, LocalDate showDate);
}
