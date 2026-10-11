package com.bluestar.tournament.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_user_id")
    private AdminUser adminUser;

    @Column(nullable = false)
    private String action;

    @Column(name = "entity_type")
    private String entityType;

    @Column(name = "entity_ref")
    private String entityRef;

    @Column(name = "metadata_json", columnDefinition = "TEXT")
    private String metadataJson;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        createdAt = Instant.now();
    }

    public void setAdminUser(AdminUser adminUser) { this.adminUser = adminUser; }
    public void setAction(String action) { this.action = action; }
    public void setEntityType(String entityType) { this.entityType = entityType; }
    public void setEntityRef(String entityRef) { this.entityRef = entityRef; }
    public void setMetadataJson(String metadataJson) { this.metadataJson = metadataJson; }
}
