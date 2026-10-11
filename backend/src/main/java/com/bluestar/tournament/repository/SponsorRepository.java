package com.bluestar.tournament.repository;

import com.bluestar.tournament.entity.Sponsor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SponsorRepository extends JpaRepository<Sponsor, Long> {
    List<Sponsor> findByTournamentIdAndActiveTrueOrderByDisplayOrderAsc(Long tournamentId);
    List<Sponsor> findByTournamentIdOrderByDisplayOrderAsc(Long tournamentId);
}
