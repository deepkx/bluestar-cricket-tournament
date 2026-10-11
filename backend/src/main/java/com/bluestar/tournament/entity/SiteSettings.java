package com.bluestar.tournament.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "site_settings")
public class SiteSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "contact_email")
    private String contactEmail;

    @Column(name = "contact_phone")
    private String contactPhone;

    @Column(name = "contact_address", columnDefinition = "TEXT")
    private String contactAddress;

    @Column(name = "social_links_json", columnDefinition = "TEXT")
    private String socialLinksJson;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }
    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
    public String getContactAddress() { return contactAddress; }
    public void setContactAddress(String contactAddress) { this.contactAddress = contactAddress; }
    public String getSocialLinksJson() { return socialLinksJson; }
    public void setSocialLinksJson(String socialLinksJson) { this.socialLinksJson = socialLinksJson; }
}
