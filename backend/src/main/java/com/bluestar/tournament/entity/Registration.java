package com.bluestar.tournament.entity;

import com.bluestar.tournament.domain.RegistrationStatus;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "registrations")
public class Registration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "public_reference", nullable = false, unique = true)
    private String publicReference;

    @Column(name = "tracking_token", nullable = false, unique = true)
    private String trackingToken;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tournament_id")
    private Tournament tournament;

    @Column(name = "team_name", nullable = false)
    private String teamName;

    @Column(name = "normalized_team_name", nullable = false)
    private String normalizedTeamName;

    @Column(name = "team_logo_path")
    private String teamLogoPath;

    private String city;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RegistrationStatus status;

    @Column(name = "slot_reservation_expires_at")
    private Instant slotReservationExpiresAt;

    @Column(name = "confirmed_at")
    private Instant confirmedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @OneToOne(mappedBy = "registration", cascade = CascadeType.ALL, orphanRemoval = true)
    private TeamContact contact;

    @OneToMany(mappedBy = "registration", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<Player> players = new ArrayList<>();

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
    public String getPublicReference() { return publicReference; }
    public void setPublicReference(String publicReference) { this.publicReference = publicReference; }
    public String getTrackingToken() { return trackingToken; }
    public void setTrackingToken(String trackingToken) { this.trackingToken = trackingToken; }
    public Tournament getTournament() { return tournament; }
    public void setTournament(Tournament tournament) { this.tournament = tournament; }
    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }
    public String getNormalizedTeamName() { return normalizedTeamName; }
    public void setNormalizedTeamName(String normalizedTeamName) { this.normalizedTeamName = normalizedTeamName; }
    public String getTeamLogoPath() { return teamLogoPath; }
    public void setTeamLogoPath(String teamLogoPath) { this.teamLogoPath = teamLogoPath; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public RegistrationStatus getStatus() { return status; }
    public void setStatus(RegistrationStatus status) { this.status = status; }
    public Instant getSlotReservationExpiresAt() { return slotReservationExpiresAt; }
    public void setSlotReservationExpiresAt(Instant slotReservationExpiresAt) { this.slotReservationExpiresAt = slotReservationExpiresAt; }
    public Instant getConfirmedAt() { return confirmedAt; }
    public void setConfirmedAt(Instant confirmedAt) { this.confirmedAt = confirmedAt; }
    public TeamContact getContact() { return contact; }
    public void setContact(TeamContact contact) { this.contact = contact; }
    public List<Player> getPlayers() { return players; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
