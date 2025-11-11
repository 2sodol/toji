DROP TABLE IF EXISTS photo_metadata;
DROP TABLE IF EXISTS action_history;
DROP TABLE IF EXISTS basic_info;

CREATE TABLE basic_info (
    basic_info_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hq_name VARCHAR(100) NOT NULL,
    branch_name VARCHAR(100) NOT NULL,
    route_name VARCHAR(100) NOT NULL,
    driving_direction VARCHAR(50) NOT NULL,
    milestone VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    occurrence_date DATE NOT NULL,
    manager_name VARCHAR(50),
    actor_name VARCHAR(100),
    related_person VARCHAR(100),
    actor_address VARCHAR(255),
    related_address VARCHAR(255),
    occupancy_rate DECIMAL(5,2),
    occupancy_area DECIMAL(12,2),
    action_status VARCHAR(50),
    pnu VARCHAR(30),
    latitude DECIMAL(11,8),
    longitude DECIMAL(11,8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE action_history (
    action_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    basic_info_id BIGINT NOT NULL,
    action_year_month CHAR(6) NOT NULL,
    description VARCHAR(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_action_history_basic
        FOREIGN KEY (basic_info_id) REFERENCES basic_info (basic_info_id)
        ON DELETE CASCADE
);

CREATE TABLE photo_metadata (
    photo_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    basic_info_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500),
    content_type VARCHAR(100),
    file_size BIGINT,
    shot_datetime TIMESTAMP,
    description VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_photo_metadata_basic
        FOREIGN KEY (basic_info_id) REFERENCES basic_info (basic_info_id)
        ON DELETE CASCADE
);

CREATE INDEX idx_basic_info_occurrence_date ON basic_info (occurrence_date);
CREATE INDEX idx_basic_info_pnu ON basic_info (pnu);
CREATE INDEX idx_action_history_basic ON action_history (basic_info_id);
CREATE INDEX idx_action_history_month ON action_history (action_year_month);
CREATE INDEX idx_photo_metadata_basic ON photo_metadata (basic_info_id);

