package com.bluestar.tournament.repository;

import com.bluestar.tournament.domain.RegistrationStatus;
import com.bluestar.tournament.entity.Registration;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {

    Optional<Registration> findByPublicReference(String publicReference);

    Optional<Registration> findByPublicReferenceAndTrackingToken(String publicReference, String trackingToken);

    boolean existsByTournamentIdAndNormalizedTeamName(Long tournamentId, String normalizedTeamName);

    java.util.Optional<Registration> findByTournamentIdAndNormalizedTeamNameAndStatus(
            Long tournamentId, String normalizedTeamName, RegistrationStatus status);

    long countByTournamentIdAndStatus(Long tournamentId, RegistrationStatus status);

    @Query("""
        SELECT COUNT(r) FROM Registration r
        WHERE r.tournament.id = :tournamentId
        AND (
            r.status = com.bluestar.tournament.domain.RegistrationStatus.CONFIRMED
            OR (r.status IN (
                com.bluestar.tournament.domain.RegistrationStatus.PENDING_PAYMENT,
                com.bluestar.tournament.domain.RegistrationStatus.PAYMENT_PROCESSING
            ) AND r.slotReservationExpiresAt > :now)
        )
        """)
    long countOccupiedSlots(@Param("tournamentId") Long tournamentId, @Param("now") Instant now);

    List<Registration> findByTournamentIdAndStatusOrderByTeamNameAsc(Long tournamentId, RegistrationStatus status);

    List<Registration> findByTournamentIdAndStatusOrderByConfirmedAtAscTeamNameAsc(
            Long tournamentId, RegistrationStatus status);

    Page<Registration> findByTournamentId(Long tournamentId, Pageable pageable);

    @Query("""
        SELECT r FROM Registration r
        WHERE r.tournament.id = :tournamentId
        AND (:q IS NULL OR LOWER(r.teamName) LIKE LOWER(CONCAT('%', :q, '%')))
        """)
    Page<Registration> searchAdmin(@Param("tournamentId") Long tournamentId, @Param("q") String q, Pageable pageable);
}
