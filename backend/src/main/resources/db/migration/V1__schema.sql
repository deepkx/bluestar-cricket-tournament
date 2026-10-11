CREATE TABLE tournaments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    format VARCHAR(64) NOT NULL DEFAULT 'KNOCKOUT',
    entry_fee_paise BIGINT NOT NULL,
    max_teams INT NOT NULL,
    min_squad_size INT NOT NULL,
    max_squad_size INT NOT NULL,
    registration_opens_at TIMESTAMP NULL,
    registration_closes_at TIMESTAMP NULL,
    registration_open_override BOOLEAN NOT NULL DEFAULT FALSE,
    registration_closed_override BOOLEAN NOT NULL DEFAULT FALSE,
    fixture_announcement_at TIMESTAMP NULL,
    fixtures_published BOOLEAN NOT NULL DEFAULT FALSE,
    timezone VARCHAR(64) NOT NULL DEFAULT 'Asia/Kolkata',
    venue VARCHAR(512),
    rules TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE registrations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    public_reference VARCHAR(32) NOT NULL,
    tracking_token VARCHAR(64) NOT NULL,
    tournament_id BIGINT NOT NULL,
    team_name VARCHAR(128) NOT NULL,
    normalized_team_name VARCHAR(128) NOT NULL,
    team_logo_path VARCHAR(512),
    city VARCHAR(128),
    status VARCHAR(32) NOT NULL,
    slot_reservation_expires_at TIMESTAMP NULL,
    confirmed_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_reg_tournament FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
    CONSTRAINT uq_reg_public_reference UNIQUE (public_reference),
    CONSTRAINT uq_reg_tracking_token UNIQUE (tracking_token),
    CONSTRAINT uq_reg_tournament_team_name UNIQUE (tournament_id, normalized_team_name)
);

CREATE INDEX idx_reg_status ON registrations(status);
CREATE INDEX idx_reg_tournament ON registrations(tournament_id);

CREATE TABLE team_contacts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    registration_id BIGINT NOT NULL,
    captain_name VARCHAR(128) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    CONSTRAINT fk_contact_reg FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE,
    CONSTRAINT uq_contact_reg UNIQUE (registration_id)
);

CREATE TABLE players (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    registration_id BIGINT NOT NULL,
    full_name VARCHAR(128) NOT NULL,
    jersey_number INT,
    playing_role VARCHAR(32),
    is_captain BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_player_reg FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE
);

CREATE INDEX idx_player_reg ON players(registration_id);

CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    registration_id BIGINT NOT NULL,
    amount_paise BIGINT NOT NULL,
    currency VARCHAR(8) NOT NULL DEFAULT 'INR',
    provider_order_id VARCHAR(64),
    provider_payment_id VARCHAR(64),
    payment_status VARCHAR(32) NOT NULL,
    paid_at TIMESTAMP NULL,
    refund_status VARCHAR(32),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_reg FOREIGN KEY (registration_id) REFERENCES registrations(id),
    CONSTRAINT uq_provider_order UNIQUE (provider_order_id),
    CONSTRAINT uq_provider_payment UNIQUE (provider_payment_id)
);

CREATE TABLE payment_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    provider_event_id VARCHAR(128) NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    payment_id BIGINT,
    processing_status VARCHAR(32) NOT NULL,
    received_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_provider_event UNIQUE (provider_event_id),
    CONSTRAINT fk_event_payment FOREIGN KEY (payment_id) REFERENCES payments(id)
);

CREATE TABLE admin_users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'ADMIN',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_admin_email UNIQUE (email)
);

CREATE TABLE tournament_matches (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tournament_id BIGINT NOT NULL,
    round_number INT NOT NULL,
    match_number INT NOT NULL,
    bracket_slot INT NOT NULL,
    team_a_registration_id BIGINT,
    team_b_registration_id BIGINT,
    scheduled_at TIMESTAMP NULL,
    venue VARCHAR(512),
    winner_registration_id BIGINT,
    result_summary VARCHAR(512),
    match_status VARCHAR(32) NOT NULL DEFAULT 'SCHEDULED',
    notes TEXT,
    published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_match_tournament FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
    CONSTRAINT fk_match_team_a FOREIGN KEY (team_a_registration_id) REFERENCES registrations(id),
    CONSTRAINT fk_match_team_b FOREIGN KEY (team_b_registration_id) REFERENCES registrations(id),
    CONSTRAINT fk_match_winner FOREIGN KEY (winner_registration_id) REFERENCES registrations(id),
    CONSTRAINT uq_match_slot UNIQUE (tournament_id, round_number, bracket_slot)
);

CREATE INDEX idx_match_tournament ON tournament_matches(tournament_id);

CREATE TABLE announcements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tournament_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority INT NOT NULL DEFAULT 0,
    published BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ann_tournament FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
);

CREATE TABLE sponsors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tournament_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    logo_path VARCHAR(512),
    website VARCHAR(512),
    category VARCHAR(128),
    display_order INT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_sponsor_tournament FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
);

CREATE TABLE gallery_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tournament_id BIGINT NOT NULL,
    image_path VARCHAR(512) NOT NULL,
    caption VARCHAR(512),
    display_order INT NOT NULL DEFAULT 0,
    published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_gallery_tournament FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
);

CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    admin_user_id BIGINT,
    action VARCHAR(128) NOT NULL,
    entity_type VARCHAR(64),
    entity_ref VARCHAR(64),
    metadata_json TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_admin FOREIGN KEY (admin_user_id) REFERENCES admin_users(id)
);

CREATE TABLE site_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(32),
    contact_address TEXT,
    social_links_json TEXT,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
