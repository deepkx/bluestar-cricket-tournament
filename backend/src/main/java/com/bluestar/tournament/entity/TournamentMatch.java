package com.bluestar.tournament.entity;

import com.bluestar.tournament.domain.MatchStatus;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "tournament_matches")
public class TournamentMatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tournament_id")
    private Tournament tournament;

    @Column(name = "round_number", nullable = false)
    private Integer roundNumber;

    @Column(name = "match_number", nullable = false)
    private Integer matchNumber;

    @Column(name = "bracket_slot", nullable = false)
    private Integer bracketSlot;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_a_registration_id")
    private Registration teamA;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_b_registration_id")
    private Registration teamB;

    @Column(name = "scheduled_at")
    private Instant scheduledAt;

    private String venue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "winner_registration_id")
    private Registration winner;

    @Column(name = "result_summary")
    private String resultSummary;

    @Enumerated(EnumType.STRING)
    @Column(name = "match_status", nullable = false)
    private MatchStatus matchStatus;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false)
    private boolean published;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public Tournament getTournament() { return tournament; }
    public void setTournament(Tournament tournament) { this.tournament = tournament; }
    public Integer getRoundNumber() { return roundNumber; }
    public void setRoundNumber(Integer roundNumber) { this.roundNumber = roundNumber; }
    public Integer getMatchNumber() { return matchNumber; }
    public void setMatchNumber(Integer matchNumber) { this.matchNumber = matchNumber; }
    public Integer getBracketSlot() { return bracketSlot; }
    public void setBracketSlot(Integer bracketSlot) { this.bracketSlot = bracketSlot; }
    public Registration getTeamA() { return teamA; }
    public void setTeamA(Registration teamA) { this.teamA = teamA; }
    public Registration getTeamB() { return teamB; }
    public void setTeamB(Registration teamB) { this.teamB = teamB; }
    public Instant getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(Instant scheduledAt) { this.scheduledAt = scheduledAt; }
    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }
    public Registration getWinner() { return winner; }
    public void setWinner(Registration winner) { this.winner = winner; }
    public String getResultSummary() { return resultSummary; }
    public void setResultSummary(String resultSummary) { this.resultSummary = resultSummary; }
    public MatchStatus getMatchStatus() { return matchStatus; }
    public void setMatchStatus(MatchStatus matchStatus) { this.matchStatus = matchStatus; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public boolean isPublished() { return published; }
    public void setPublished(boolean published) { this.published = published; }
}
