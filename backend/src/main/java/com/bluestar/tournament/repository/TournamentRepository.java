package com.bluestar.tournament.repository;

import com.bluestar.tournament.entity.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TournamentRepository extends JpaRepository<Tournament, Long> {
    Optional<Tournament> findFirstByOrderByIdAsc();
}
