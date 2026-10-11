package com.bluestar.tournament.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "team_contacts")
public class TeamContact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "registration_id")
    private Registration registration;

    @Column(name = "captain_name", nullable = false)
    private String captainName;

    @Column
    private String phone;

    @Column
    private String email;

    public Long getId() { return id; }
    public Registration getRegistration() { return registration; }
    public void setRegistration(Registration registration) { this.registration = registration; }
    public String getCaptainName() { return captainName; }
    public void setCaptainName(String captainName) { this.captainName = captainName; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
