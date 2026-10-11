package com.bluestar.tournament.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "players")
public class Player {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "registration_id")
    private Registration registration;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "jersey_number")
    private Integer jerseyNumber;

    @Column(name = "playing_role")
    private String playingRole;

    @Column(name = "is_captain", nullable = false)
    private boolean captain;

    @Column(name = "photo_path")
    private String photoPath;

    public Long getId() { return id; }
    public Registration getRegistration() { return registration; }
    public void setRegistration(Registration registration) { this.registration = registration; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public Integer getJerseyNumber() { return jerseyNumber; }
    public void setJerseyNumber(Integer jerseyNumber) { this.jerseyNumber = jerseyNumber; }
    public String getPlayingRole() { return playingRole; }
    public void setPlayingRole(String playingRole) { this.playingRole = playingRole; }
    public boolean isCaptain() { return captain; }
    public void setCaptain(boolean captain) { this.captain = captain; }
    public String getPhotoPath() { return photoPath; }
    public void setPhotoPath(String photoPath) { this.photoPath = photoPath; }
}
