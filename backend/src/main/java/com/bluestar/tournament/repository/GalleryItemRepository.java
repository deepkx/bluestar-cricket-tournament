package com.bluestar.tournament.repository;

import com.bluestar.tournament.entity.GalleryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GalleryItemRepository extends JpaRepository<GalleryItem, Long> {
    List<GalleryItem> findByTournamentIdAndPublishedTrueOrderByDisplayOrderAsc(Long tournamentId);
    List<GalleryItem> findByTournamentIdOrderByDisplayOrderAsc(Long tournamentId);
}
