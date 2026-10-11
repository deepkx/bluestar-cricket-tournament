package com.bluestar.tournament.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "tournaments")
public class Tournament {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String format;

    @Column(name = "entry_fee_paise", nullable = false)
    private Long entryFeePaise;

    @Column(name = "max_teams", nullable = false)
    private Integer maxTeams;

    @Column(name = "min_squad_size", nullable = false)
    private Integer minSquadSize;

    @Column(name = "max_squad_size", nullable = false)
    private Integer maxSquadSize;

    @Column(name = "registration_opens_at")
    private Instant registrationOpensAt;

    @Column(name = "registration_closes_at")
    private Instant registrationClosesAt;

    @Column(name = "registration_open_override", nullable = false)
    private boolean registrationOpenOverride;

    @Column(name = "registration_closed_override", nullable = false)
    private boolean registrationClosedOverride;

    @Column(name = "fixture_announcement_at")
    private Instant fixtureAnnouncementAt;

    @Column(name = "tournament_starts_at")
    private Instant tournamentStartsAt;

    @Column(name = "fixtures_published", nullable = false)
    private boolean fixturesPublished;

    @Column(nullable = false)
    private String timezone;

    private String venue;

    @Column(columnDefinition = "TEXT")
    private String rules;

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
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getFormat() { return format; }
    public void setFormat(String format) { this.format = format; }
    public Long getEntryFeePaise() { return entryFeePaise; }
    public void setEntryFeePaise(Long entryFeePaise) { this.entryFeePaise = entryFeePaise; }
    public Integer getMaxTeams() { return maxTeams; }
    public void setMaxTeams(Integer maxTeams) { this.maxTeams = maxTeams; }
    public Integer getMinSquadSize() { return minSquadSize; }
    public void setMinSquadSize(Integer minSquadSize) { this.minSquadSize = minSquadSize; }
    public Integer getMaxSquadSize() { return maxSquadSize; }
    public void setMaxSquadSize(Integer maxSquadSize) { this.maxSquadSize = maxSquadSize; }
    public Instant getRegistrationOpensAt() { return registrationOpensAt; }
    public void setRegistrationOpensAt(Instant registrationOpensAt) { this.registrationOpensAt = registrationOpensAt; }
    public Instant getRegistrationClosesAt() { return registrationClosesAt; }
    public void setRegistrationClosesAt(Instant registrationClosesAt) { this.registrationClosesAt = registrationClosesAt; }
    public boolean isRegistrationOpenOverride() { return registrationOpenOverride; }
    public void setRegistrationOpenOverride(boolean registrationOpenOverride) { this.registrationOpenOverride = registrationOpenOverride; }
    public boolean isRegistrationClosedOverride() { return registrationClosedOverride; }
    public void setRegistrationClosedOverride(boolean registrationClosedOverride) { this.registrationClosedOverride = registrationClosedOverride; }
    public Instant getFixtureAnnouncementAt() { return fixtureAnnouncementAt; }
    public void setFixtureAnnouncementAt(Instant fixtureAnnouncementAt) { this.fixtureAnnouncementAt = fixtureAnnouncementAt; }
    public Instant getTournamentStartsAt() { return tournamentStartsAt; }
    public void setTournamentStartsAt(Instant tournamentStartsAt) { this.tournamentStartsAt = tournamentStartsAt; }
    public boolean isFixturesPublished() { return fixturesPublished; }
    public void setFixturesPublished(boolean fixturesPublished) { this.fixturesPublished = fixturesPublished; }
    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }
    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }
    public String getRules() { return rules; }
    public void setRules(String rules) { this.rules = rules; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
